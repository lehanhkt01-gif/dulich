const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- KHỞI TẠO DỮ LIỆU DI SẢN DANH THẮNG KÝ EA SÚP ---');

  // 1. Tạo Users (Admin & Editor)
  const adminPassword = await bcrypt.hash('AdminEaSup@2025!', 10);
  const editorPassword = await bcrypt.hash('EditorEaSup@2025!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@easup.daklak.gov.vn' },
    update: {},
    create: {
      id: 'user-admin-1',
      name: 'Cán Bộ Văn Hóa Ea Súp',
      email: 'admin@easup.daklak.gov.vn',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@easup.daklak.gov.vn' },
    update: {},
    create: {
      id: 'user-editor-1',
      name: 'Ban Biên Tập Di Sản',
      email: 'editor@easup.daklak.gov.vn',
      password: editorPassword,
      role: 'EDITOR',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  console.log('✓ Khởi tạo tài khoản Quản trị & Ban biên tập thành công');

  // 2. Tạo Categories
  const categories = [
    {
      id: 'cat-di-tich',
      name: 'Di tích Lịch sử & Kiến trúc',
      slug: 'di-tich-lich-su',
      icon: 'Landmark',
      description: 'Các công trình kiến trúc cổ kính, di tích kháng chiến hào hùng trên dải đất biên cương Ea Súp.',
    },
    {
      id: 'cat-thac-ho',
      name: 'Thác nước & Hồ cảnh quan',
      slug: 'thac-nuoc-ho-canh-quan',
      icon: 'Waves',
      description: 'Mặt nước hồ thủy lợi mênh mông, thác ghềnh giữa lòng rừng khộp đại ngàn hoang sơ.',
    },
    {
      id: 'cat-buon-lang',
      name: 'Không gian Văn hóa Buôn làng',
      slug: 'khong-gian-van-hoa-buon-lang',
      icon: 'Campfire',
      description: 'Bản sắc nhà dài, cồng chiêng, nghề dệt thổ cẩm và men rượu cần nồng ấm của người Êđê, Gia Rai.',
    },
    {
      id: 'cat-sinh-thai',
      name: 'Du lịch Sinh thái & Nông nghiệp',
      slug: 'du-lich-sinh-thai-nong-nghiep',
      icon: 'Trees',
      description: 'Trải nghiệm vườn xoài cát Ea Súp OCOP 4 sao, ngắm hệ sinh thái rừng khộp và du lịch voi thân thiện.',
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log('✓ Khởi tạo 4 danh mục chuyên đề thành công');

  // 3. Tạo Danh Thắng Tiêu Biểu
  const destinations = [
    {
      id: 'dest-yang-prong',
      title: 'Tháp Chàm Yang PRông - Ngọn Tháp Cổ Độc Nhất Tây Nguyên',
      slug: 'thap-cham-yang-prong',
      subTitle: 'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia duy nhất của người Chăm xây dựng tại Tây Nguyên',
      historicalPeriod: 'Cuối thế kỷ XIII (Thời vua Sinhavarman III / Chế Mân)',
      content: `Nằm ẩn mình dưới tán rừng cổ thụ bạt ngàn bên dòng sông Ea H'leo thuộc xã Ea Rốk (tiếp giáp trung tâm Ea Súp), Tháp Yang PRông (tiếng Êđê nghĩa là Tháp Thần Lớn) là công trình kiến trúc Chăm Pa cổ duy nhất được phát hiện và bảo tồn nguyên vẹn trên toàn vùng đất Tây Nguyên.\n\nĐược xây dựng vào cuối thế kỷ 13 dưới triều đại vua Sinhavarman III (vua Chế Mân, người có mối tình khắc cốt ghi tâm với Công chúa Huyền Trân của Đại Việt), tháp thờ thần Siva biểu trưng cho sự sinh sôi, thịnh vượng và trường tồn. Khác với các cụm tháp ven biển miền Trung, tháp Yang PRông đứng đơn độc giữa rừng già, xây bằng gạch nung đỏ thắm xếp khít khao không thấy mạch vữa, đỉnh tháp vươn lên trời xanh như đóa sen hé nở.\n\nĐối với đồng bào Êđê, M'nông bản địa suốt nhiều thế kỷ qua, ngọn tháp là chốn linh thiêng ngự trị của thần Yang linh hiển. Du khách khi ghé thăm sẽ cảm nhận được sự giao thoa văn hóa kỳ diệu giữa văn minh Champa cổ và tín ngưỡng vạn vật hữu linh của đồng bào các dân tộc Tây Nguyên.`,
      audioVoiceUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg',
      thumbnail: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
      ],
      address: 'Thôn 1, Xã Ea Rốk, Xã Ea Súp, Đắk Lắk',
      latitude: 13.2435,
      longitude: 107.8228,
      bestSeason: 'Tháng 11 đến Tháng 4 năm sau (Mùa khô, không khí dịu mát, rừng khộp rụng lá vàng rực)',
      entryFee: 'Miễn phí tham quan',
      visitingHours: '07:00 - 17:30 hằng ngày',
      culturalNotes: 'Khi bước vào khuôn viên tháp cổ, du khách vui lòng giữ trật tự, ăn mặc trang trọng, không leo trèo lên thành gạch cổ hoặc khắc vẽ lên thân tháp. Cởi mũ nón khi thắp hương tưởng niệm.',
      isPublished: true,
      isFeatured: true,
      viewsCount: 3420,
      categoryId: 'cat-di-tich',
      createdById: admin.id,
    },
    {
      id: 'dest-ho-easup-thuong',
      title: 'Hồ Ea Súp Thượng - Biển Hồ Mênh Mông Vùng Biên Viễn',
      slug: 'ho-ea-sup-thuong',
      subTitle: 'Một trong những công trình hồ chứa thủy lợi nhân tạo lớn nhất vùng Tây Nguyên',
      historicalPeriod: 'Khởi công xây dựng năm 2001, khánh thành năm 2004',
      content: `Với diện tích mặt nước rộng hơn 1.400 hecta và sức chứa lên đến 146 triệu mét khối nước, Hồ Ea Súp Thượng không chỉ là "bầu sữa ngọt ngào" cung cấp nước tưới cho bạt ngàn ruộng lúa, vườn cây ăn trái của xã Ea Súp, Đắk Lắk mà còn là viên ngọc sinh thái tuyệt mỹ.\n\nMặt hồ trong xanh phẳng lặng như tấm gương khổng lồ phản chiếu mây trời đại ngàn. Xung quanh hồ là những dải đồi thoai thoải rợp bóng bạch đàn và rừng khộp hoang sơ. Vào những buổi chiều tà, hoàng hôn buông xuống mặt hồ nhuộm ánh cam đỏ rực rỡ, những chiếc thuyền độc mộc của ngư dân bản địa khua mái chèo lững lờ tạo nên bức tranh thủy mặc bình yên đến nao lòng.`,
      audioVoiceUrl: 'https://actions.google.com/sounds/v1/ambiences/lake_waves_shore.ogg',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
      ],
      address: 'Thôn 9 & Thôn Cư Bang, Xã Cư M\'lan & Ea Súp, Đắk Lắk',
      latitude: 13.2381,
      longitude: 107.9512,
      bestSeason: 'Tháng 10 đến Tháng 3 (Mực nước hồ dâng đầy, trời trong xanh lộng gió, ngắm hoàng hôn đẹp nhất)',
      entryFee: 'Miễn phí tham quan / Thuê thuyền dạo hồ có tính phí riêng',
      visitingHours: '05:30 - 18:30 (Khuyên ngắm bình minh và hoàng hôn)',
      culturalNotes: 'Tuân thủ mặc áo phao cứu sinh khi lên thuyền ngắm cảnh lòng hồ. Giữ gìn vệ sinh môi trường, không xả rác xuống nguồn nước sinh hoạt của nhân dân.',
      isPublished: true,
      isFeatured: true,
      viewsCount: 2890,
      categoryId: 'cat-thac-ho',
      createdById: admin.id,
    },
    {
      id: 'dest-buon-a2-cong-chieng',
      title: 'Không Gian Văn Hóa Buôn A2 & Tiếng Cồng Chiêng Bên Bếp Lửa',
      slug: 'khong-gian-buon-a2-cong-chieng',
      subTitle: 'Nơi lưu giữ nguyên vẹn nếp nhà dài truyền thống và di sản Không gian văn hóa Cồng chiêng',
      historicalPeriod: 'Địa bàn tụ cư truyền thống qua hàng trăm năm của người Êđê Knơ',
      content: `Buôn A2 thuộc thị trấn Ea Súp là một trong những buôn làng tiêu biểu còn bảo tồn được kiến trúc nhà dài truyền thống - biểu tượng chế độ mẫu hệ của người Êđê. Nhà dài như một tiếng chiêng ngân, mỗi lần người con gái lấy chồng, ngôi nhà lại được nối dài thêm một gian.\n\nTại gian khách (Gah), du khách sẽ được chiêm ngưỡng chiếc ghế Kpan dài bằng cả thân cây cổ thụ nguyên khối, chiếc trống H'gơr thiêng liêng và dàn cồng chiêng Knah ngân vang. Dưới ánh lửa bập bùng trong đêm hội, các nghệ nhân già cùng thế hệ thanh niên trẻ tấu lên khúc ca Aria, uống giọt rượu cần ủ bằng men lá rừng và thưởng thức món canh cà đắng cá suối đậm đà phong vị núi rừng.`,
      audioVoiceUrl: 'https://actions.google.com/sounds/v1/ambiences/campfire.ogg',
      thumbnail: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=1200&q=80',
      ],
      address: 'Buôn A2, Xã Ea Súp, Đắk Lắk',
      latitude: 13.1950,
      longitude: 107.8812,
      bestSeason: 'Tháng Chạp đến Tháng 3 âm lịch (Mùa lễ hội đâm trâu cũ, mừng lúa mới, cúng bến nước)',
      entryFee: 'Liên hệ già làng / Đặt biểu diễn giao lưu cồng chiêng theo đoàn',
      visitingHours: 'Cả ngày (Đặc biệt hấp dẫn vào buổi tối giao lưu văn nghệ)',
      culturalNotes: 'Người Êđê có phong tục bước lên nhà dài phải bước bằng cầu thang cái (có hình đôi bầu sữa mẹ và trăng lưỡi liềm). Không tự ý gõ chiêng thiêng khi chưa có sự cho phép của chủ nhà hoặc già làng.',
      isPublished: true,
      isFeatured: true,
      viewsCount: 1980,
      categoryId: 'cat-buon-lang',
      createdById: editor.id,
    },
    {
      id: 'dest-yok-don-easup',
      title: 'Vườn Quốc Gia Yok Đôn - Trạm Cửa Rừng Ea Súp & Du Lịch Voi Thân Thiện',
      slug: 'vuon-quoc-gia-yok-don-tram-ea-sup',
      subTitle: 'Khu bảo tồn hệ sinh thái rừng khộp lớn nhất Việt Nam với mô hình bảo tồn voi nhân đạo',
      historicalPeriod: 'Thành lập năm 1992, mở rộng phân khu sinh thái biên giới Ea Súp',
      content: `Vườn Quốc gia Yok Đôn là một trong những khu bảo tồn thiên nhiên lớn nhất cả nước, nơi bảo tồn hệ sinh thái rừng rụng lá họ Dầu (rừng khộp) độc nhất vô nhị ở Việt Nam. Phân khu rừng Ea Súp trải dài dọc theo dòng sông Sêrêpôk huyền thoại với hệ động thực vật vô cùng trù phú.\n\nĐiểm đặc sắc nhất hiện nay tại Yok Đôn là mô hình "Du lịch Voi Thân Thiện" (Elephant-friendly Tourism). Thay vì cưỡi voi gây áp lực lên động vật, du khách được các nài voi dẫn đường đi bộ xuyên rừng, quan sát đàn voi tự do kiếm ăn, tắm sông, cà mình vào thân cây gỗ trong môi trường hoang dã tự nhiên. Cảm giác lắng nghe tiếng bước chân voi giẫm lên lớp lá khô xào xạc mang lại xúc cảm kết nối nguyên sơ cùng thiên nhiên.`,
      audioVoiceUrl: 'https://actions.google.com/sounds/v1/ambiences/forest_daytime.ogg',
      thumbnail: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      ],
      address: 'Tiểu khu 247, Hạt Kiểm Lâm Ea Súp - VQG Yok Đôn, Đắk Lắk',
      latitude: 13.0425,
      longitude: 107.7289,
      bestSeason: 'Tháng 12 đến Tháng 4 (Mùa rừng khộp thay lá đỏ vàng tuyệt đẹp, dễ dàng theo chân đàn voi)',
      entryFee: 'Vé tham quan cửa rừng: 60.000đ/người lớn | Tour theo dõi voi: 400.000đ - 800.000đ/người',
      visitingHours: '06:30 - 17:00 hằng ngày',
      culturalNotes: 'Giữ khoảng cách an toàn tối thiểu 20m với voi rừng. Không cho voi ăn thức ăn lạ, không mặc trang phục quá sặc sỡ và không tạo tiếng động lớn làm hoảng sợ thú rừng.',
      isPublished: true,
      isFeatured: false,
      viewsCount: 2450,
      categoryId: 'cat-sinh-thai',
      createdById: admin.id,
    },
    {
      id: 'dest-vuon-xoai-ocop',
      title: 'Vùng Trồng Xoài Cát Ea Súp & Nông Trại Trải Nghiệm OCOP',
      slug: 'vung-xoai-cat-ea-sup-ocop',
      subTitle: 'Thương hiệu trái cây vàng của vùng đất nắng gió Ea Súp đạt chuẩn OCOP 4 sao',
      historicalPeriod: 'Phát triển mạnh mẽ từ những năm 2010 với diện tích hơn 3.000 hecta',
      content: `Nhờ nguồn thổ nhưỡng đất phù sa cổ màu mỡ kết hợp khí hậu nhiều nắng gió đặc thù của vùng trũng Ea Súp, cây xoài cát và xoài Ba Màu nơi đây cho trái to tròn, vỏ mỏng vàng óng, thịt thơm ngọt đậm đà khác biệt.\n\nĐến với vùng chuyên canh xoài cát Ea Súp, du khách được tự tay hái những trái xoài chín mọng ngay tại vườn, thưởng thức sinh tố xoài mát lạnh, bánh tráng xoài dẻo cay và mật ong hoa xoài rừng nguyên chất. Đây là điểm dừng chân lý tưởng kết hợp mua sắm đặc sản OCOP địa phương làm quà lưu niệm sau chuyến hành trình khám phá biên cương.`,
      audioVoiceUrl: 'https://actions.google.com/sounds/v1/ambiences/country_morning.ogg',
      thumbnail: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80',
      ],
      address: 'Thôn 4 & Hợp Tác Xã Xoài Ea Súp, Xã Ea Súp, Đắk Lắk',
      latitude: 13.2190,
      longitude: 107.9050,
      bestSeason: 'Tháng 3 đến Tháng 6 (Vụ thu hoạch rộ xoài chín rực rỡ khắp các miệt vườn)',
      entryFee: 'Vào vườn miễn phí / Mua xoài tính theo giá thu hoạch tại vườn',
      visitingHours: '07:30 - 17:30',
      culturalNotes: 'Vui lòng hái quả theo hướng dẫn của chủ vườn, không bẻ cành non hoặc giẫm đạp lên hệ thống tưới nhỏ giọt tự động.',
      isPublished: true,
      isFeatured: false,
      viewsCount: 1670,
      categoryId: 'cat-sinh-thai',
      createdById: editor.id,
    }
  ];

  for (const d of destinations) {
    await prisma.destination.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    });
  }
  console.log('✓ Khởi tạo danh sách danh thắng di tích & điểm du lịch thành công');

  // 4. Tạo Itineraries
  const itineraries = [
    {
      id: 'itin-1',
      title: 'Hành Trình 1 Ngày: Dấu Ấn Tháp Cổ & Biển Hồ Vùng Biên',
      durationDays: '1 Ngày',
      targetAudience: 'Gia đình & Du khách tham quan trong ngày',
      coverImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      routeDetails: [
        {
          time: '07:30 - 09:30',
          title: 'Chiêm ngưỡng Tháp Cổ Yang PRông',
          destinationSlug: 'thap-cham-yang-prong',
          description: 'Đón bình minh qua ngọn tháp cổ chìm trong sương sớm rừng Ea Rốk, lắng nghe audio thuyết minh về mối tình vua Chế Mân và công chúa Huyền Trân.',
          culinaryTip: 'Ăn sáng bánh ướt thịt nướng tại trung tâm Ea Rốk.',
        },
        {
          time: '10:00 - 12:00',
          title: 'Ghé thăm Vườn Xoài Cát OCOP Ea Súp',
          destinationSlug: 'vung-xoai-cat-ea-sup-ocop',
          description: 'Tận mắt thấy những chùm xoài trĩu cành, trải nghiệm hái xoài và nhâm nhi nước ép xoài tươi thanh mát.',
          culinaryTip: 'Thưởng thức gỏi xoài khô bò cá lóc đồng quê.',
        },
        {
          time: '12:30 - 14:30',
          title: 'Nghỉ trưa & Ẩm thực lòng hồ Ea Súp Thượng',
          destinationSlug: 'ho-ea-sup-thuong',
          description: 'Dừng chân tại nhà chòi ven hồ ngắm mặt nước mênh mông như biển hồ giữa thung lũng.',
          culinaryTip: 'Món cá bống kho nghệ, gà nướng cơm lam chấm muối ớt é rừng.',
        },
        {
          time: '15:00 - 17:30',
          title: 'Du thuyền đón Hoàng Hôn trên Hồ Ea Súp Thượng',
          destinationSlug: 'ho-ea-sup-thuong',
          description: 'Thuê thuyền độc mộc hoặc cano dạo lòng hồ, ngắm đàn chim trời bay về tổ lúc chiều buông.',
          culinaryTip: 'Mua khô cá lóc hồ Ea Súp và xoài sấy dẻo làm quà biếu.',
        },
      ],
    },
    {
      id: 'itin-2',
      title: 'Hành Trình 2 Ngày 1 Đêm: Khám Phá Đại Ngàn Rừng Khộp & Đêm Hội Cồng Chiêng',
      durationDays: '2 Ngày 1 Đêm',
      targetAudience: 'Người yêu thiên nhiên, Nhiếp ảnh & Văn hóa bản địa',
      coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
      routeDetails: [
        {
          time: 'Ngày 1 - Sáng',
          title: 'Theo chân đàn Voi Thân Thiện tại Vườn Quốc Gia Yok Đôn',
          destinationSlug: 'vuon-quoc-gia-yok-don-tram-ea-sup',
          description: 'Đi bộ trekking dưới tán rừng khộp rụng lá vàng, tận mắt quan sát voi tìm thức ăn hoang dã một cách an lành.',
          culinaryTip: 'Cơm nắm lá dong mang theo trong rừng.',
        },
        {
          time: 'Ngày 1 - Chiều & Tối',
          title: 'Buôn A2 - Trải nghiệm nếp Nhà Dài & Giao lưu Lửa Thiêng Cồng Chiêng',
          destinationSlug: 'khong-gian-buon-a2-cong-chieng',
          description: 'Check-in buôn làng cổ, nghe già làng kể khan, hòa mình vào điệu múa Xoang và vít cong cần rượu.',
          culinaryTip: 'Canh thụt ống nứa, vếch bò nướng, rượu cần nếp thơm truyền thống.',
        },
        {
          time: 'Ngày 2 - Sáng',
          title: 'Khám phá huyền tích Tháp Yang PRông',
          destinationSlug: 'thap-cham-yang-prong',
          description: 'Thăm tháp cổ Chăm Pa độc nhất Tây Nguyên trong không gian u tịch của rừng cổ thụ Ea H\'leo.',
          culinaryTip: 'Cà phê nguyên chất rang xay Ea Súp đón nắng mai.',
        },
        {
          time: 'Ngày 2 - Chiều',
          title: 'Check-in Cửa Khẩu Bu Prăng & Vành đai Biên giới Ea Súp',
          destinationSlug: 'ho-ea-sup-thuong',
          description: 'Ngắm cột mốc biên cương, những đồi cỏ lau bao la và mua sắm đặc sản tiêu hạt Ea Súp.',
          culinaryTip: 'Hạt điều rang củi, mật ong rừng hoa tràm Ea Súp.',
        },
      ],
    },
  ];

  for (const it of itineraries) {
    await prisma.itineraryItem.upsert({
      where: { id: it.id },
      update: it,
      create: it,
    });
  }
  console.log('✓ Khởi tạo các gợi ý lịch trình thành công');

  // 5. Thêm Reviews mẫu
  const reviews = [
    {
      id: 'rev-1',
      rating: 5,
      comment: 'Một di sản vô cùng kỳ bí giữa lòng Tây Nguyên! Tiếng chuông gió và tiếng rừng cây rì rào bên tháp cổ tạo cảm giác an yên lạ kỳ.',
      destinationId: 'dest-yang-prong',
      userName: 'Nguyễn Hải Đăng (Hà Nội)',
      isApproved: true,
    },
    {
      id: 'rev-2',
      rating: 5,
      comment: 'Hệ thống thuyết minh audio tự động rất hay, giọng truyền cảm giúp tôi hiểu rõ lịch sử vua Chế Mân và ý nghĩa ngôi tháp đối với người Êđê.',
      destinationId: 'dest-yang-prong',
      userName: 'Lê Thu Hương (TP. HCM)',
      isApproved: true,
    },
    {
      id: 'rev-3',
      rating: 5,
      comment: 'Cảnh hoàng hôn ở đây đẹp ngoạn mục! Thưởng thức cá bống kho nghệ lòng hồ cùng cơm lam dẻo thơm thì không còn gì bằng.',
      destinationId: 'dest-ho-easup-thuong',
      userName: 'Trần Văn Nam',
      isApproved: true,
    },
  ];

  for (const rev of reviews) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: rev,
      create: rev,
    });
  }
  console.log('✓ Khởi tạo đánh giá du khách thành công');
  console.log('=== HOÀN TẤT SEED DỮ LIỆU THÀNH CÔNG ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
