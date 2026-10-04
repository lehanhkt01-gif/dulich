import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getStoredUserByEmail, upsertStoredUser } from '@/lib/storage';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        const normalizedEmail = user.email.toLowerCase().trim();
        const existing = getStoredUserByEmail(normalizedEmail);
        if (!existing) {
          upsertStoredUser({
            name: user.name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            avatar: user.image,
            role: 'TRAVELER',
          });
        } else {
          // Cập nhật avatar nếu có thay đổi
          if (user.image && user.image !== existing.avatar) {
            upsertStoredUser({
              ...existing,
              avatar: user.image,
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (token?.email) {
        const dbUser = getStoredUserByEmail((token.email as string).toLowerCase());
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role || 'TRAVELER';
          token.restaurantName = dbUser.restaurantName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role || 'TRAVELER';
        (session.user as any).restaurantName = token.restaurantName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/mon-ngon',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
