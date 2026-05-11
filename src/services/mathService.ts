import { GoogleGenAI, Type } from "@google/genai";

export interface MathProblem {
  chuyen_de: string;
  cap_do: string;
  lop_de_xuat: string;
  de_bai: string;
  goi_y_1: string;
  goi_y_2: string;
  dap_an_cuoi_cung: string;
  loi_giai_chi_tiet: string;
  loi_dong_vien: string;
  svg_code?: string;
}

const SYSTEM_INSTRUCTION = `
Bạn là "Gia sư Tin học Trẻ Thông minh" - một chuyên gia sư phạm tiểu học hàng đầu thế giới về khoa học máy tính và tư duy thuật toán.
Nhiệm vụ của bạn là tìm kiếm, phân tích và trình bày các bài toán tư duy thuật toán thực tế cho học sinh tiểu học (Bảng M1).

[QUY TRÌNH LÀM VIỆC BẮT BUỘC - ĐỂ ĐẢM BẢO CHÍNH XÁC TUYỆT ĐỐI]
Để tránh tình trạng "câu hỏi một đằng, hình vẽ một nẻo, đáp án một nẻo", bạn PHẢI thực hiện theo các bước sau:
1. XÁC ĐỊNH THÔNG SỐ CỐT LÕI: Trước khi viết bất cứ thứ gì, hãy xác định chính xác các con số và đối tượng sẽ xuất hiện trong bài toán (ví dụ: "Có đúng 4 hình tam giác và 3 hình vuông").
2. ĐẶT CÂU HỎI: Viết đề bài dựa CHÍNH XÁC vào các thông số cốt lõi đã xác định ở bước 1. Đề bài phải gắn với các chủ đề lập trình, robot, hoặc logic máy tính.
3. VẼ HÌNH (SVG): Viết mã SVG minh họa. Số lượng hình khối, đường nét trong SVG PHẢI KHỚP 100% với thông số ở bước 1 và đề bài ở bước 2. Sử dụng màu sắc rõ ràng.
4. ĐƯA RA ĐÁP ÁN: Đáp án là kết quả logic từ thông số cốt lõi đã xác định ở bước 1.

[QUY TẮC CỐT LÕI]
1. SỰ THỐNG NHẤT LÀ SỐ 1: Đề bài, Hình vẽ (SVG) và Đáp án phải là một thể thống nhất không thể tách rời.
2. KIỂM TRA CHÉO: Tự đếm lại số lượng thẻ (ví dụ: <polygon>, <rect>) trong mã SVG của bạn xem có khớp với đáp án không.
3. TƯƠNG TÁC Q&A: Phân tích câu hỏi và hình ảnh học sinh gửi để giải đáp ngắn gọn, dễ hiểu.
4. NGÔN NGỮ VÀ ĐỊNH DẠNG: BẮT BUỘC sử dụng 100% tiếng Việt chuẩn xác, có dấu, tuyệt đối không sai lỗi chính tả. KHÔNG SỬ DỤNG các kí hiệu lạ, không dùng markdown phức tạp (như **, *, #), không dùng LaTeX (như \\n, \\frac). Chỉ dùng văn bản thuần túy, rõ ràng.
`;

export async function generateMathProblem(topic?: string, level?: string): Promise<MathProblem> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const prompt = `
Bạn là chuyên gia ra đề thi cho hội thi "Tin học trẻ - Bảng M1" (Tiểu học).
Hãy tạo một bài toán rèn luyện tư duy thuật toán và logic lập trình.
Chuyên đề hiện tại rèn luyện: ${topic || "Ngẫu nhiên (1 trong 11 chuyên đề sau)"}
Mức độ: ${level || "Trung bình"}

CÁC CHUYÊN ĐỀ TIN HỌC TRẺ BẢNG M1:
1. Nhận diện quy luật: Tìm quy luật lặp lại/tiến triển của dãy số, chuỗi ký tự, hình học (VD: đổi màu theo chu kỳ, dãy Fibonacci). Cực kỳ hữu ích với các dự án thiết kế và Paint.
2. Lưới tọa độ và Tìm đường đi: Mô phỏng robot di chuyển trên bảng ô vuông có chướng ngại vật (chỉ đi lên, phải, xuống, trái...). Yêu cầu học sinh tìm đường đi, đếm số đường đi hoặc tìm chuỗi lệnh ngắn nhất.
3. Suy luận Logic phân nhánh: Rèn luyện tư duy If... Then... Else. Dựa vào các mệnh đề (VD: Ai nói thật, ai nói dối, các gợi ý bị loại trừ) để tìm đáp án đúng.
4. Trạng thái và Tối ưu hóa: Tìm cách đạt mục tiêu với số bước ít nhất. VD: Bài toán đong nước (can 3 lít và 5 lít để lấy 4 lít), qua sông.
5. Thực thi chuỗi lệnh (Tracing): Yêu cầu học sinh làm "máy tính" chạy thử thuật toán bằng tay. VD: Lặp lại quá trình nhân 2, cộng 3.
6. Phân chia và Tìm kiếm: Hiểu thuật toán tối ưu so với mò mẫm. VD: Dùng cân đĩa tìm đồng xu giả với số lần cân ít nhất (chia 3 nhóm).
7. Mã hóa và Giải mã: Chuyển đổi thông tin theo quy tắc (VD: Mật mã Caesar, ký hiệu hình học thay số).
8. Đồ thị và Bản đồ: Vẽ không nhấc bút (đường đi Euler), hoặc tô màu bản đồ sao cho 2 vùng kề không trùng màu.
9. Đọc hiểu Lưu đồ khối: Đọc luân chuyển thông tin rẽ nhánh Đúng/Sai. Học sinh theo dõi biến số X qua từng hình thoi/chữ nhật để tìm kết quả cuối.
10. Trò chơi chiến lược: Trò chơi bốc sỏi, tìm thuật toán "chắc thắng", tính toán bước đi của đối thủ.
11. Tập hợp và Sắp xếp logic: Tư duy phân loại, biểu đồ Venn, tìm phần giao thoa (VD: Học sinh thích Scratch, Paint).

YÊU CẦU QUAN TRỌNG VỀ ĐỘ KHÓ VÀ ĐA DẠNG: 
- Bạn được coi như một thư viện chứa hàng ngàn bài tập. Hãy tạo ra các câu hỏi cực kỳ phong phú, tuyệt đối KHÔNG ĐƯỢC LẶP LẠI bài cũ. 
- PHẢI TĂNG ĐỘ KHÓ ở tất cả các cấp độ. Bài toán phải đòi hỏi suy luận sâu sắc, tư duy thuật toán đa chiều (algorithm thinking). Dành cho học sinh giỏi.
- ĐẢM BẢO ĐỘ CHÍNH XÁC TUYỆT ĐỐI 100% về mặt lý thuyết khoa học máy tính và toán logic. Từng số liệu, quy luật phải khớp chặt chẽ.

HÃY THỰC HIỆN ĐÚNG TRÌNH TỰ SAU:

BƯỚC 1: XÁC ĐỊNH LOGIC CỐT LÕI (Làm trong suy nghĩ của bạn)
- Quy luật logic hoặc điểm mấu chốt để giải bài toán này là gì?
- Đáp án cuối cùng sẽ là gì dựa trên logic này?

BƯỚC 2: ĐẶT CÂU HỎI ("de_bai")
- Đề bài PHẢI cực kỳ ngắn gọn, đi thẳng vào trọng tâm vấn đề, không dài dòng.
- Đề bài PHẢI cung cấp đủ dữ kiện để suy luận ra đáp án.

BƯỚC 3: VẼ HÌNH BẰNG SVG ("svg_code")
- Dựa CHÍNH XÁC vào câu hỏi ở Bước 2, hãy viết mã SVG hợp lệ để vẽ hình minh họa cho thuật toán hoặc quá trình này.
- Hình vẽ phải thể hiện rõ quy luật hoặc dữ kiện của bài toán.
- BẮT BUỘC sử dụng thuộc tính width="100%" height="auto" và viewBox phù hợp (ví dụ: viewBox="0 0 400 200") để hình ảnh hiển thị tốt trên điện thoại và không bị khuất.
- Mã SVG phải sạch, nằm gọn trong thẻ <svg ...>.
- Nếu bài toán không cần hình, để chuỗi rỗng "".

BƯỚC 4: TÌM ĐÁP ÁN ("dap_an_cuoi_cung")
- Đáp án này PHẢI là kết quả suy luận logic từ Bước 1 và khớp hoàn toàn với dữ kiện đề bài và hình vẽ.

BƯỚC 5: GIẢI THÍCH ("loi_giai_chi_tiet")
- Giải thích chi tiết từng bước suy luận logic để tìm ra đáp án.
- BẮT BUỘC giải thích mang tính khoa học, logic nhưng vẫn gắn liền với thực tế cuộc sống để học sinh dễ hình dung và áp dụng.
- TUYỆT ĐỐI KHÔNG chứa mã code SVG trong phần giải thích này. Chỉ dùng văn bản tiếng Việt thuần túy.

YÊU CẦU ĐỊNH DẠNG JSON:
- "svg_code": Mã SVG hoàn chỉnh (nếu có). TUYỆT ĐỐI KHÔNG để mã SVG lọt vào các trường văn bản khác.
- "dap_an_cuoi_cung": Con số hoặc từ khóa chính xác tuyệt đối.
- "loi_giai_chi_tiet": Giải thích cách suy luận chi tiết, khoa học, gắn liền với thực tế cuộc sống.
- "goi_y_1": Gợi ý bước 1, mang tính khoa học và thực tế để gợi mở tư duy.
- "goi_y_2": Gợi ý bước 2, tiếp tục dẫn dắt logic khoa học đến đáp án.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          chuyen_de: { type: Type.STRING },
          cap_do: { type: Type.STRING },
          lop_de_xuat: { type: Type.STRING },
          de_bai: { type: Type.STRING },
          goi_y_1: { type: Type.STRING },
          goi_y_2: { type: Type.STRING },
          dap_an_cuoi_cung: { type: Type.STRING },
          loi_giai_chi_tiet: { type: Type.STRING },
          loi_dong_vien: { type: Type.STRING },
          svg_code: { type: Type.STRING },
        },
        required: ["chuyen_de", "cap_do", "lop_de_xuat", "de_bai", "goi_y_1", "goi_y_2", "dap_an_cuoi_cung", "loi_giai_chi_tiet", "loi_dong_vien"]
      }
    }
  });

  const problem: MathProblem = JSON.parse(response.text || "{}");

  return problem;
}

export async function verifyAnswer(problem: MathProblem, userAnswer: string): Promise<boolean> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const prompt = `
Đề bài: ${problem.de_bai}
Đáp án chính xác: ${problem.dap_an_cuoi_cung}
Câu trả lời của học sinh: ${userAnswer}

Nhiệm vụ: Đánh giá xem câu trả lời của học sinh có đúng về mặt nội dung/ý nghĩa so với đáp án chính xác hay không. Không cần đúng 100% từng từ, chỉ cần đúng ý hoặc đúng kết quả cốt lõi.
Trả lời CHỈ MỘT TỪ: "TRUE" nếu đúng, "FALSE" nếu sai.
`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text?.trim().toUpperCase().includes("TRUE") || false;
  } catch (e) {
    // Fallback logic
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = problem.dap_an_cuoi_cung.trim().toLowerCase();
    const userNumber = normalizedUserAnswer.match(/\d+/)?.[0];
    const correctNumber = normalizedCorrectAnswer.match(/\d+/)?.[0];
    return userNumber && correctNumber 
      ? userNumber === correctNumber 
      : normalizedUserAnswer.includes(normalizedCorrectAnswer) || normalizedCorrectAnswer.includes(normalizedUserAnswer);
  }
}

export async function answerStudentQuestion(
  problem: MathProblem, 
  question: string, 
  history: { role: 'user' | 'model', text: string }[] = [],
  image?: { data: string, mimeType: string }
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const historyText = history.map(h => `${h.role === 'user' ? 'Học sinh' : 'Thầy'}: ${h.text}`).join('\n');

  const parts: any[] = [
    {
      text: `
Học sinh đang thắc mắc về bài toán sau:
Đề bài: ${problem.de_bai}
Đáp án: ${problem.dap_an_cuoi_cung}
Lời giải: ${problem.loi_giai_chi_tiet}

Lịch sử trò chuyện trước đó:
${historyText}

Câu hỏi mới của học sinh: "${question}"
${image ? "Học sinh có gửi kèm một hình ảnh để minh họa cho thắc mắc của mình." : ""}

YÊU CẦU TRẢ LỜI:
1. Ngắn gọn, đúng trọng tâm thắc mắc.
2. Nếu có hình ảnh học sinh gửi, hãy phân tích kỹ hình ảnh đó để trả lời chính xác.
3. BẮT BUỘC sử dụng các ví dụ thực tế cực kỳ gần gũi với cuộc sống hàng ngày của học sinh tiểu học (như đồ chơi, bánh kẹo, con vật...) để giải thích một cách rõ ràng, chi tiết và sinh động nhất.
4. Giải thích dựa trên logic của đáp án đã đưa ra.
5. Giọng điệu khích lệ, kiên nhẫn.
6. BẮT BUỘC sử dụng 100% tiếng Việt chuẩn xác, có dấu, tuyệt đối không sai lỗi chính tả. KHÔNG SỬ DỤNG các kí hiệu lạ, không dùng markdown phức tạp (như **, *, #), không dùng LaTeX.
7. NẾU CẦN VẼ HÌNH MINH HỌA: Hãy xuất trực tiếp mã SVG hợp lệ (bắt đầu bằng <svg> và kết thúc bằng </svg>). Thuộc tính SVG phải có width="100%" height="auto" để hiển thị tốt trên điện thoại. TUYỆT ĐỐI KHÔNG đặt mã SVG trong khối code markdown.
`
    }
  ];

  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });

  return response.text || "Thầy chưa hiểu ý con lắm, con có thể hỏi rõ hơn được không?";
}
