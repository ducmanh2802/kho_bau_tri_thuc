# MASTER PROMPT — XÂY DỰNG PHÂN HỆ HỌC CỜ VUA TỪ CƠ BẢN ĐẾN NÂNG CAO
## Dự án: Kho Báu Tri Thức — Lớp 1

Bạn là chuyên gia giáo dục trẻ 5–8 tuổi, huấn luyện viên cờ vua thiếu nhi, chuyên gia thiết kế game giáo dục và kỹ sư phần mềm cấp cao.

Hãy kiểm tra toàn bộ source code hiện tại của ứng dụng **Kho Báu Tri Thức — Lớp 1**, sau đó trực tiếp thiết kế, lập trình và tích hợp một phân hệ học cờ vua hoàn chỉnh có tên:

**VƯƠNG QUỐC CỜ VUA — CHIẾN BINH NHÍ**

Mục tiêu là giúp một em bé mới bắt đầu từ con số 0 có thể nhận biết quân cờ, hiểu luật, tự chơi một ván cờ hợp lệ, biết chiếu bí và từng bước tiếp cận chiến thuật nâng cao.

Đây là yêu cầu BUILD TÍNH NĂNG THỰC TẾ, không phải chỉ viết kế hoạch, mockup hay tạo một trang giới thiệu.

---

# PHẦN 1 — NGUYÊN TẮC BẮT BUỘC

1. Đọc kiến trúc, công nghệ, giao diện, hệ thống điều hướng, lưu tiến độ và các component hiện có trước khi sửa.
2. Giữ nguyên các chức năng Toán, Tiếng Việt, Chính tả và các phân hệ đang hoạt động.
3. Không viết lại toàn bộ ứng dụng nếu chỉ cần thêm một phân hệ.
4. Tái sử dụng component, design system, hệ thống điểm thưởng và lưu tiến độ hiện có khi phù hợp.
5. Giao diện ưu tiên tiếng Việt chuẩn Unicode, hiển thị đúng dấu, font dễ đọc, đặc biệt trên điện thoại.
6. Nội dung và luật cờ phải chính xác. Không tạo câu hỏi có đáp án sai, nước đi bất hợp lệ hoặc tình huống cờ không thể xảy ra.
7. Không dùng nút bấm giả, dữ liệu tiến độ giả, AI đối thủ chỉ đứng yên hoặc bàn cờ chỉ để trang trí.
8. Mọi nước đi trên bàn cờ phải được kiểm tra bằng bộ luật cờ vua thực sự.
9. Nếu dự án đã có thư viện cờ vua phù hợp, hãy đánh giá và tái sử dụng. Nếu chưa có, cân nhắc chess.js hoặc thư viện tương đương để xác thực nước đi, chiếu, chiếu bí, hòa và các luật đặc biệt. Kiểm tra khả năng tương thích với cấu hình hiện tại trước khi cài đặt.
10. Nếu có chế độ đấu với máy, sử dụng engine cờ vua thực sự nếu môi trường cho phép. Ưu tiên Stockfish qua Web Worker khi tương thích; phải có phương án dự phòng nếu engine không tải được hoặc thiết bị yếu. Không tuyên bố có AI cờ vua thật nếu thực tế chỉ là các nước đi ngẫu nhiên.
11. Không làm lộ API key, không thêm dịch vụ trả phí bắt buộc và không tự ý triển khai production.
12. Bảo toàn dữ liệu người dùng, thay đổi hiện có và khả năng chạy ứng dụng trên mobile.
13. Nếu thiếu một tài nguyên, hãy kiểm tra các tài nguyên sẵn có trước khi tạo mới. Không để đường dẫn hình ảnh bị hỏng.
14. Sau khi hoàn thành, chạy typecheck, lint nếu có, test và build theo các script thực tế của dự án. Không tuyên bố PASS nếu chưa chạy hoặc chưa xác minh.

---

# PHẦN 2 — THIẾT KẾ TRẢI NGHIỆM CHO TRẺ

Tạo một thế giới phiêu lưu cờ vua có cốt truyện đơn giản:

“Vương quốc Cờ Vua đang cần một chiến binh nhí. Con hãy thu thập 6 viên ngọc sức mạnh bằng cách học các quân cờ, vượt qua thử thách, giải cứu nhà vua và trở thành Đại kiện tướng nhí.”

Mỗi bài học gồm:

- Một nhân vật hướng dẫn thân thiện.
- Một mục tiêu học duy nhất, rõ ràng.
- Hình minh họa quân cờ lớn, dễ nhận biết.
- Giải thích ngắn, dùng ngôn ngữ phù hợp trẻ lớp 1.
- Bàn cờ tương tác hoặc bài tập kéo thả.
- Ví dụ đúng và ví dụ sai.
- 3–8 câu hỏi thực hành tùy độ khó.
- Phản hồi ngay khi con trả lời.
- Giải thích tại sao đúng hoặc sai.
- Phần thưởng, huy hiệu và tiến độ.
- Nút “Học tiếp”, “Luyện lại” và “Về bản đồ”.

Không sử dụng các đoạn văn quá dài. Mỗi màn hình chỉ nên tập trung vào một kiến thức chính.

Thiết kế hình ảnh vui tươi, cao cấp, nhất quán với ứng dụng hiện tại. Có thể dùng chủ đề lâu đài, bản đồ kho báu, các hiệp sĩ và linh vật. Không để hoạt ảnh che bàn cờ hoặc gây khó đọc.

## Trang bản đồ học tập

Hiển thị lộ trình theo các vùng đất:

1. Làng Quân Cờ.
2. Con Đường Nước Đi.
3. Thành Phố Phòng Thủ.
4. Rừng Chiến Thuật.
5. Lâu Đài Chiếu Bí.
6. Đấu Trường Đại Kiện Tướng.

Mỗi vùng có bài học, số sao, phần trăm hoàn thành và trạng thái khóa/mở khóa. Trẻ vẫn có thể ôn bài cũ bất cứ lúc nào.

---

# PHẦN 3 — CHƯƠNG TRÌNH HỌC TỪ CƠ BẢN ĐẾN NÂNG CAO

Xây dựng hệ thống bài học theo các cấp độ sau. Mỗi bài phải có nội dung giải thích, ví dụ trên bàn cờ, bài tập và đáp án được kiểm tra.

## Cấp độ 0 — Làm quen với cờ vua

### Bài 1. Đây là trò chơi gì?
- Cờ vua có hai người chơi.
- Một bên Trắng, một bên Đen.
- Mục tiêu là chiếu bí vua đối phương.
- Hai bên lần lượt đi từng nước.
- Trắng đi trước.
- Giới thiệu bàn cờ, ô cờ, hàng, cột và đường chéo.

### Bài 2. Bàn cờ có bao nhiêu ô?
- Bàn cờ có 8 hàng và 8 cột, tổng cộng 64 ô.
- Hai màu ô sáng và tối xen kẽ.
- Cách đặt bàn cờ đúng: ô sáng ở góc dưới bên phải của mỗi người chơi.
- Làm quen tọa độ a–h và 1–8 bằng bài tập đơn giản.

### Bài 3. Đội quân của con
Giới thiệu tổng cộng 32 quân:
- 1 vua mỗi bên.
- 1 hậu mỗi bên.
- 2 xe mỗi bên.
- 2 tượng mỗi bên.
- 2 mã mỗi bên.
- 8 tốt mỗi bên.

Cho trẻ đếm quân, ghép tên với hình và phân biệt quân Trắng/Đen.

## Cấp độ 1 — Nhận biết sáu loại quân

Mỗi loại quân phải có một chuỗi bài học riêng:

### Bài 4. Vua — Người quan trọng nhất
- Vua đi một ô theo bất kỳ hướng nào.
- Vua không được đi vào ô bị quân đối phương tấn công.
- Hai vua không được đứng cạnh nhau.
- Vua không bị bắt theo cách thông thường; ván cờ kết thúc khi vua bị chiếu bí.

### Bài 5. Hậu — Nữ hoàng quyền lực
- Hậu đi ngang, dọc và chéo.
- Hậu có thể đi nhiều ô nếu đường đi thông thoáng.
- Hậu không được nhảy qua quân khác.

### Bài 6. Xe — Chiến xa
- Xe đi ngang hoặc dọc.
- Đi nhiều ô nếu không bị cản.
- Không đi chéo và không nhảy qua quân.

### Bài 7. Tượng — Người bảo vệ đường chéo
- Tượng đi chéo.
- Không nhảy qua quân.
- Tượng bắt quân đối phương trên đường chéo hợp lệ.
- Tượng xuất phát trên ô sáng sẽ luôn ở ô sáng; tượng xuất phát trên ô tối sẽ luôn ở ô tối.

### Bài 8. Mã — Kỵ sĩ nhảy xa
- Mã đi theo hình chữ L: hai ô theo một hướng rồi một ô vuông góc.
- Mã là quân duy nhất có thể nhảy qua các quân khác.
- Cho trẻ nhận diện các ô mã có thể tới từ một vị trí.

### Bài 9. Tốt — Người lính dũng cảm
- Tốt đi thẳng một ô khi phía trước trống.
- Tốt có thể đi hai ô từ vị trí ban đầu nếu cả hai ô phía trước đều trống.
- Tốt ăn chéo một ô về phía trước.
- Tốt không đi lùi.
- Khi tới hàng cuối của đối phương, tốt được phong cấp thành hậu, xe, tượng hoặc mã.
- Giải thích bắt tốt qua đường ở mức đơn giản, sau đó có bài thực hành riêng.

### Bài 10. Ai đi kiểu gì?
- Bài tập phân loại nước đi của cả sáu loại quân.
- Chọn đúng hướng đi.
- Tìm các ô đến hợp lệ.
- Tìm quân có thể bị ăn.
- Phân biệt đi quân và ăn quân.
- Sử dụng bàn cờ để trẻ chạm vào các ô đáp án.

**Yêu cầu quan trọng:** Không chỉ hiển thị hình minh họa và câu hỏi chữ. Bàn cờ phải phản ánh chính xác vị trí, nước đi và quân bị bắt.

## Cấp độ 2 — Di chuyển, bắt quân và bảo vệ quân

### Bài 11. Đi đến ô nào?
Trẻ chọn quân rồi chọn một ô đích. Hệ thống tô các ô hợp lệ và giải thích.

### Bài 12. Ăn quân nào?
Cho các tình huống có quân đối phương. Trẻ chọn quân có thể bị bắt hợp lệ.

### Bài 13. Đường đi bị chặn
- Quân nào không thể nhảy qua quân khác?
- Vì sao xe không thể đi xuyên qua tốt?
- Mã có gì đặc biệt?

### Bài 14. Quân nào đang được bảo vệ?
- Nhận biết quân được đồng minh bảo vệ.
- Tìm quân đối phương đang tấn công.
- Tránh để mất quân miễn phí.

### Bài 15. Quân nào có giá trị cao hơn?
Dùng giá trị quy ước để giúp trẻ tư duy:
- Tốt = 1.
- Mã = 3.
- Tượng = 3.
- Xe = 5.
- Hậu = 9.
- Vua = vô giá, không được đem đổi theo cách thông thường.

Giải thích đây là giá trị tương đối để học chiến thuật, không phải luật bắt buộc của cờ vua.

### Bài 16. Đổi quân có lợi không?
Cho trẻ chọn giữa các phương án ăn quân khác nhau và giải thích đơn giản vì sao một nước đi có lợi hoặc bất lợi.

## Cấp độ 3 — Bắt đầu một ván cờ hoàn chỉnh

### Bài 17. Xếp quân đúng vị trí
- Bàn cờ được định hướng đúng.
- Hậu Trắng ở ô trắng, hậu Đen ở ô đen.
- Xe ở góc, mã cạnh xe, tượng cạnh mã.
- Hậu và vua ở hai ô còn lại của hàng cuối.
- Tốt đứng ở hàng phía trước.
- Kiểm tra đầy đủ bố trí chuẩn.

### Bài 18. Luật chơi một ván cờ
- Trắng đi trước.
- Hai bên luân phiên.
- Mỗi lượt chỉ thực hiện một nước hợp lệ, trừ các luật đặc biệt.
- Không được đi nước khiến vua của mình vẫn bị chiếu hoặc bị chiếu.
- Giới thiệu kết thúc ván cờ.

### Bài 19. Nhập thành
- Điều kiện nhập thành cánh vua và cánh hậu.
- Vua và xe liên quan chưa từng di chuyển.
- Các ô ở giữa phải trống.
- Vua không đang bị chiếu, không đi qua ô bị tấn công và không kết thúc ở ô bị tấn công.
- Không cho nhập thành xuyên qua quân hoặc trong tình huống không hợp lệ.

### Bài 20. Phong cấp tốt
- Tốt tới hàng cuối phải phong cấp.
- Có thể chọn hậu, xe, tượng hoặc mã.
- Hướng dẫn chọn quân phù hợp trong các tình huống đơn giản.

### Bài 21. Bắt tốt qua đường
- Giải thích điều kiện xảy ra.
- Chỉ hợp lệ ngay ở nước đi kế tiếp.
- Có minh họa từng bước và bài tập thực hành.

### Bài 22. Thế nào là hòa?
Dạy các trường hợp cơ bản:
- Hết nước đi hợp lệ nhưng vua không bị chiếu: hòa do hết nước đi (stalemate).
- Hai bên đồng ý hòa.
- Vị trí không thể dẫn đến chiếu bí theo luật.
- Quy tắc lặp lại vị trí và quy tắc 50 nước ở cấp nâng cao hơn.
- Những quy tắc đòi hỏi yêu cầu hòa hoặc cách đếm nước phải được triển khai theo đúng luật cờ thực tế.

## Cấp độ 4 — Chiếu vua và chiếu bí

### Bài 23. Chiếu vua là gì?
- Vua đang bị một quân đối phương tấn công.
- Phải xử lý tình trạng chiếu.
- Không được bỏ qua chiếu để đi một nước không liên quan.

### Bài 24. Ba cách thoát chiếu
1. Di chuyển vua tới ô an toàn.
2. Bắt quân đang chiếu nếu nước bắt hợp lệ.
3. Chặn đường chiếu nếu loại quân và vị trí cho phép.

Giải thích chặn chiếu không áp dụng với mã hoặc các tình huống không có đường đi để chặn.

### Bài 25. Nước đi nào không thể thoát chiếu?
Cho trẻ thử các phương án. Hệ thống phải kiểm tra bằng luật cờ thực, không dùng câu trả lời viết sẵn không khớp vị trí.

### Bài 26. Chiếu đôi
Giới thiệu khi vua bị hai quân tấn công cùng lúc và thường phải di chuyển vua để thoát chiếu.

### Bài 27. Chiếu bí là gì?
- Vua đang bị chiếu và không có nước đi hợp lệ nào để thoát.
- Phân biệt chiếu bí với hòa do hết nước đi.
- Bài tập nhận diện các vị trí chiếu bí.

### Bài 28. Chiếu bí bằng hậu và vua
- Hạn chế vùng di chuyển của vua đối phương.
- Đưa vua đối phương về mép bàn.
- Phối hợp hậu và vua để chiếu bí.
- Dùng vị trí bài tập được xác thực bằng engine hoặc kiểm tra luật.

### Bài 29. Chiếu bí bằng xe và vua
- Học nguyên tắc đẩy vua về mép bàn.
- Dùng vua hỗ trợ xe.
- Tránh để vua đối phương thoát ra.
- Thực hành theo từng bước.

### Bài 30. Những mẫu chiếu bí cơ bản
- Chiếu bí hàng cuối.
- Chiếu bí bằng hai xe khi vị trí cho phép.
- Chiếu bí bằng hậu và vua.
- Chiếu bí bằng xe và vua.
- Nhận biết các mẫu chiếu bí đơn giản từ những thế cờ hợp lệ.

## Cấp độ 5 — Chiến thuật thông minh

### Bài 31. Quân bị treo
Tìm quân của mình đang bị tấn công mà chưa được bảo vệ đủ.

### Bài 32. Đòn đôi
Một quân tấn công hai mục tiêu cùng lúc.

### Bài 33. Ghim quân
Giải thích ghim tuyệt đối và ghim tương đối bằng bàn cờ trực quan.

### Bài 34. Xiên quân
Tấn công quân giá trị cao phía trước để có thể lấy quân phía sau.

### Bài 35. Tấn công mở và chiếu mở
Cho trẻ thấy việc di chuyển một quân có thể mở đường cho quân khác tấn công.

### Bài 36. Đòn nhử và đánh lạc hướng
Tạo các thế cờ nhỏ, có đáp án xác thực.

### Bài 37. Phòng thủ trước đòn tấn công
- Di chuyển quân.
- Bảo vệ quân.
- Đổi quân.
- Chặn đường tấn công khi hợp lệ.
- Tìm nước đi tốt nhất trong các lựa chọn.

### Bài 38. Chiến thuật ăn quân miễn phí
Tìm nước đi có thể thắng quân hoặc tránh mất quân.

### Bài 39. Tính trước một đến ba nước
Dạy trẻ hỏi:
- Nếu con đi nước này, đối thủ có thể làm gì?
- Sau nước đáp trả, con sẽ làm gì?
- Quân nào đang bị đe dọa?

## Cấp độ 6 — Khai cuộc, trung cuộc và tàn cuộc

### Bài 40. Ba mục tiêu khi khai cuộc
- Kiểm soát trung tâm.
- Phát triển mã và tượng.
- Đưa vua vào an toàn, thường bằng nhập thành khi phù hợp.

### Bài 41. Những sai lầm khai cuộc phổ biến
- Di chuyển cùng một quân quá nhiều lần mà không có lý do.
- Đưa hậu ra quá sớm khi dễ bị tấn công.
- Bỏ quên vua.
- Chỉ chăm chăm ăn tốt mà bỏ qua phát triển quân.

### Bài 42. Phát triển quân và phối hợp
Học cách để các quân hỗ trợ nhau thay vì hoạt động riêng lẻ.

### Bài 43. Tấn công vua an toàn
Nhận biết khi nào nên tấn công và khi nào cần phòng thủ.

### Bài 44. Tàn cuộc vua và tốt
- Vua là quân chủ động trong tàn cuộc.
- Tạo tốt thông.
- Hộ tống tốt phong cấp.
- Học đối vua và ô vuông của tốt bằng ví dụ trực quan.

### Bài 45. Đối vua và zugzwang
Giới thiệu ở mức phù hợp, mở rộng cho trẻ đã hoàn thành các bài cơ bản.

### Bài 46. Luật 50 nước, lặp lại vị trí và quy tắc nâng cao
Dạy chính xác các điều kiện hòa theo luật cờ, phân biệt những trường hợp tự động hòa và trường hợp phải yêu cầu hòa.

## Cấp độ 7 — Đấu luyện và tư duy nâng cao

### Bài 47. Chơi với máy theo cấp độ
- Cấp 1: đi chậm, gợi ý rõ.
- Cấp 2: biết bắt quân miễn phí.
- Cấp 3: biết tránh nước đi mất quân.
- Cấp 4: biết tìm chiến thuật cơ bản.
- Cấp 5: thử thách nâng cao.

Độ khó phải dựa trên engine thật hoặc phương pháp giới hạn sức chơi có giải thích rõ. Không được khẳng định mức Elo chính xác nếu chưa được đo kiểm.

### Bài 48. Giải đố chiến thuật
- Chiếu trong một nước.
- Chiếu bí trong một nước.
- Bắt quân có lợi.
- Tìm cách thoát chiếu.
- Bảo vệ quân đang bị tấn công.

### Bài 49. Phân tích ván cờ của con
- Xem lại từng nước.
- Phát hiện quân bị mất.
- Giải thích một nước tốt hơn theo ngôn ngữ thiếu nhi.
- Không dùng đánh giá “nước đi tốt nhất” nếu chưa có engine hoặc phương pháp xác thực đáng tin cậy.

### Bài 50. Giải đấu Đại kiện tướng nhí
- Đấu với máy hoặc đối thủ khác nếu dự án hỗ trợ.
- Chơi ván hoàn chỉnh.
- Lưu lịch sử ván.
- Chấm điểm theo kỹ năng, không chỉ thắng thua.
- Trao huy hiệu theo thành tích thực tế.

Có thể mở rộng thành bài 51 trở đi khi phù hợp. Không cần nhồi tất cả bài vào một màn hình; phải tổ chức thành chương trình có thể phát triển lâu dài.

---

# PHẦN 4 — BÀN CỜ TƯƠNG TÁC THỰC SỰ

Xây dựng bàn cờ 8×8 với các yêu cầu:

1. Hiển thị đủ 64 ô, quân cờ rõ ràng và có thể chọn bằng chuột hoặc chạm.
2. Có thể kéo thả quân nếu giao diện hiện tại hỗ trợ tốt; luôn cung cấp phương án chạm quân rồi chạm ô đích.
3. Hiển thị các nước đi hợp lệ.
4. Tô màu ô quân đang chọn, nước đi trước đó và ô vua đang bị chiếu.
5. Hiển thị quân đã bị bắt.
6. Có thể hoàn tác trong chế độ luyện tập nếu phù hợp.
7. Có nút khởi động lại bài, gợi ý và kiểm tra đáp án.
8. Có chế độ hướng dẫn theo từng bước.
9. Bàn cờ thích ứng với màn hình 320px, 375px, 390px, tablet và desktop.
10. Không để quân cờ bị méo, ô bàn cờ bị lệch hoặc các nút điều khiển tràn màn hình.
11. Tôn trọng thao tác bàn phím và khả năng tiếp cận cơ bản.
12. Cập nhật trạng thái sau mỗi nước đi hợp lệ.

## Quy tắc kỹ thuật

- Tất cả nước đi trong chế độ chơi thật phải qua bộ luật cờ vua.
- Không cho phép di chuyển khiến vua của người đi vẫn bị chiếu.
- Phân biệt chiếu, chiếu bí, hòa do hết nước đi và các trường hợp hòa khác.
- Hỗ trợ nhập thành, phong cấp và bắt tốt qua đường.
- Đặt quân ban đầu theo đúng tiêu chuẩn.
- Nếu có chế độ hai người chơi trên cùng thiết bị, luân phiên lượt chính xác.
- Nếu engine hoặc thư viện luật không tải được, báo lỗi rõ ràng và không cho chơi theo trạng thái giả.

---

# PHẦN 5 — HỆ THỐNG SƯ PHẠM VÀ CÁ NHÂN HÓA

Xây dựng một vòng lặp học tập:

Dạy ngắn → Xem ví dụ → Tự thử → Nhận phản hồi → Làm lại → Ôn tập → Mở bài mới.

## Phân biệt ba trạng thái

- Chưa học.
- Đang học.
- Đã thành thạo.

Không đánh dấu thành thạo chỉ vì trẻ mở bài hoặc bấm qua màn hình.

## Cách đánh giá

Mỗi bài có:
- Số câu đã làm.
- Số câu đúng.
- Số lần dùng gợi ý.
- Kỹ năng đã nắm vững.
- Kỹ năng cần luyện thêm.

Khi trẻ sai:
- Giải thích thân thiện.
- Cho thử lại.
- Gợi ý theo từng bước.
- Không trừ điểm nặng hoặc làm trẻ xấu hổ.

Khi trẻ làm đúng:
- Khen cụ thể: “Con đã tìm được đường đi của mã!”
- Cấp sao hoặc huy hiệu theo kết quả thật.

Tạo hệ thống ôn tập các câu từng làm sai. Ưu tiên luyện lại kỹ năng yếu thay vì liên tục đưa câu mới.

Nếu ứng dụng đã có hệ thống lưu tiến độ, tích hợp vào đó. Nếu chưa có, xây dựng giải pháp phù hợp kiến trúc hiện tại. Không làm mất tiến độ khi tải lại trang; xử lý lỗi lưu dữ liệu và phiên bản dữ liệu an toàn.

---

# PHẦN 6 — CHẤT LƯỢNG DỮ LIỆU VÀ TÍNH ĐÚNG ĐẮN

Tổ chức dữ liệu bài học theo cấu trúc ổn định. Mỗi bài tập nên có:
- ID duy nhất.
- Mã bài học.
- Mục tiêu kiến thức.
- Vị trí bàn cờ ban đầu.
- Lượt đi.
- Nhiệm vụ của trẻ.
- Đáp án hoặc tập hợp nước đi hợp lệ.
- Giải thích.
- Gợi ý.
- Độ khó.
- Tài nguyên hình ảnh nếu cần.

Có thể dùng FEN để biểu diễn vị trí cờ và UCI/SAN hoặc định dạng tương đương để lưu nước đi, nhưng phải xác minh tính hợp lệ bằng thư viện luật cờ.

## Validator bắt buộc

Tạo kiểm tra tự động để phát hiện:
- ID trùng lặp.
- Bài học thiếu tiêu đề hoặc nội dung.
- FEN không hợp lệ.
- Nước đi đáp án không hợp lệ.
- Bài chiếu bí không thực sự chiếu bí.
- Bài thoát chiếu có đáp án không thoát chiếu.
- Hình minh họa không tồn tại.
- Câu hỏi không khớp với vị trí bàn cờ.
- Câu trả lời mẫu mâu thuẫn với giải thích.
- Liên kết bài học hoặc tài nguyên bị hỏng.
- Tiến độ tham chiếu đến bài không còn tồn tại.

Không chỉ kiểm tra hình thức JSON; cần kiểm tra ngữ nghĩa bằng bộ luật cờ thực.

Tất cả dữ liệu bài tập phải được rà soát tự động và kiểm tra các trường hợp đặc biệt. Không tự bịa vị trí hoặc đáp án rồi đánh dấu đã kiểm chứng.

---

# PHẦN 7 — GIAO DIỆN VÀ TÍCH HỢP

Thêm mục “Cờ vua” vào điều hướng hiện có của Kho Báu Tri Thức.

Trang chính nên có:
- Nút “Học tiếp”.
- Bản đồ hành trình.
- Tiến độ học.
- Các kỹ năng đã thành thạo.
- Khu vực luyện tập nhanh.
- Khu vực đấu với máy nếu đã triển khai thành công.

Mỗi bài học phải có:
- Phần giải thích.
- Bàn cờ hoặc hình minh họa phù hợp.
- Nhiệm vụ rõ ràng.
- Phản hồi.
- Gợi ý.
- Nút làm lại và học tiếp.

Không thay đổi các phân hệ khác ngoài phạm vi cần thiết để tích hợp.

Không thêm các component UI mới nếu đã có component tương đương trong dự án. Dùng thống nhất font, khoảng cách, màu sắc, trạng thái loading/error/empty.

---

# PHẦN 8 — KIỂM THỬ VÀ RÀ SOÁT TOÀN DỰ ÁN

Kiểm tra ít nhất:

### Kiểm thử luật cờ
- Đủ 32 quân ở vị trí bắt đầu.
- Trắng đi trước.
- Các loại quân đi đúng quy tắc.
- Xe, tượng, hậu không nhảy qua quân.
- Mã nhảy qua quân được.
- Tốt đi và ăn đúng hướng.
- Không cho đi nước bất hợp lệ.
- Không để vua tự đi vào ô bị tấn công.
- Nhập thành đúng và sai điều kiện.
- Phong cấp.
- Bắt tốt qua đường.
- Chiếu và thoát chiếu.
- Chiếu bí.
- Hòa do hết nước đi.
- Hoàn tác, khởi động lại và đổi lượt.
- Không bị sai trạng thái sau nhiều nước đi liên tiếp.

### Kiểm thử giáo dục
- Câu hỏi đúng với vị trí trên bàn cờ.
- Đáp án được xác thực.
- Gợi ý không tiết lộ sai đáp án.
- Điểm số và huy hiệu được tính đúng.
- Bài học khóa/mở theo đúng tiến độ.
- Lưu và khôi phục tiến độ hoạt động.

### Kiểm thử giao diện
Kiểm tra tại các viewport:
- 320×568.
- 375×667.
- 390×844.
- Tablet.
- Desktop.

Kiểm tra font tiếng Việt, dấu câu, quân cờ, nút bấm, bàn cờ, cuộn trang, lỗi console, tài nguyên ảnh, loading và trạng thái lỗi.

### Kiểm thử hồi quy
- Toán học vẫn hoạt động.
- Tiếng Việt và Chính tả vẫn hoạt động.
- Điều hướng chung vẫn hoạt động.
- Lưu tiến độ các phân hệ cũ không bị ảnh hưởng.
- Không có lỗi typecheck, lint hoặc build mới.

---

# PHẦN 9 — CÁCH TRIỂN KHAI

Thực hiện theo thứ tự:

1. Kiểm tra cấu trúc và kiến trúc dự án.
2. Báo cáo ngắn các component, router, hệ thống lưu tiến độ và thư viện cờ có thể tái sử dụng.
3. Lập kế hoạch file sẽ tạo/sửa.
4. Triển khai bản MVP có chất lượng trước:
   - Trang chính.
   - Nhận biết quân.
   - Nước đi hợp lệ.
   - Bài tập tương tác.
   - Chiếu và chiếu bí cơ bản.
   - Tiến độ.
5. Mở rộng các chương nâng cao theo cùng cấu trúc.
6. Chạy validator dữ liệu và kiểm thử luật.
7. Chạy typecheck, lint, test và build theo dự án.
8. Mở Preview thực tế, kiểm tra thao tác bàn cờ và giao diện trên mobile nếu môi trường hỗ trợ.
9. Sửa các lỗi phát hiện được rồi kiểm thử lại.
10. Báo cáo kết quả cuối cùng.

Nếu toàn bộ 50 bài vượt quá khả năng triển khai an toàn trong một lượt, hãy hoàn thiện MVP có thể sử dụng thật trước, rồi xây dựng các bài còn lại theo từng nhóm. Không tạo 50 bài chỉ có nội dung sơ sài để tuyên bố đã hoàn thành.

# PHẦN 10 — BÁO CÁO CUỐI CÙNG

Sau khi thực hiện, hãy báo cáo:

1. Các tính năng đã xây dựng thực sự.
2. Danh sách bài học đã hoàn thành, bài nào mới có nội dung và bài nào có tương tác đầy đủ.
3. Bộ luật cờ và engine nào đã được tích hợp.
4. Số bài tập đã được validator kiểm tra.
5. Kết quả typecheck, lint, test và build.
6. Kết quả kiểm tra giao diện trên mobile và desktop.
7. Các lỗi phát hiện và cách sửa.
8. Các vấn đề chưa hoàn thành hoặc chưa xác minh.
9. Các file chính đã tạo hoặc sửa.

Không được ghi PASS nếu chưa chạy kiểm thử. Không được ghi “AI chơi được”, “chiếu bí chính xác” hoặc “toàn bộ 50 bài hoàn thành” nếu chưa có bằng chứng thực tế.

**Bắt đầu bằng việc kiểm tra source code hiện tại, sau đó trực tiếp xây dựng và kiểm thử phân hệ Vương Quốc Cờ Vua trong ứng dụng Kho Báu Tri Thức — Lớp 1.**