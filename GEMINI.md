# COMIT BOOTH — MASTER DEVELOPMENT & FIGMA IMPLEMENTATION SPECIFICATION

> **STATUS:** EXISTING PROJECT — UI/UX UPDATE & SYSTEM IMPROVEMENT
> 
> **IMPORTANT:** COMIT Booth sudah memiliki website dan functionality yang berjalan.
> Jangan membuat aplikasi baru dari nol.
> 
> Tugas utama adalah:
> 
> **MENERAPKAN DESAIN FIGMA FINAL KE PROJECT EXISTING, MEMANFAATKAN SELURUH RESOURCE YANG SUDAH DISEDIAKAN, MEMPERTAHANKAN FUNCTIONALITY YANG SUDAH BERJALAN, DAN MEMASTIKAN SEMUA FITUR TERINTEGRASI TANPA KONFLIK.**

---

# 1. PROJECT IDENTITY

**Nama Project:** COMIT Booth
**Organisasi:** COMIT — Community of Information Technology
**Universitas:** Universitas Insan Pembangunan Indonesia
**Kabinet:** Avantera
**Production Website:** [https://combooth.vercel.app/](https://combooth.vercel.app/)
**Figma Design:** [https://www.figma.com/design/qQyxN1tXbbNz47MmFMUDJY/TEAM-PROJECT?node-id=226-2&t=ugTkN0PTMmpvfiqG-1](https://www.figma.com/design/qQyxN1tXbbNz47MmFMUDJY/TEAM-PROJECT?node-id=226-2&t=ugTkN0PTMmpvfiqG-1)

---

# 2. TECHNOLOGY

Project menggunakan:
- JavaScript
- Node.js
- React jika sudah digunakan pada project existing
- HTML/CSS sesuai struktur existing
- Browser Web Camera API
- Canvas untuk photo composition jika digunakan oleh existing project
- Vercel untuk deployment

### IMPORTANT
Jangan mengganti technology stack existing tanpa alasan teknis yang kuat.

Jika React sudah digunakan:
> Pertahankan React.

Jika component atau library existing sudah bekerja:
> Reuse component/library tersebut.

---

# 3. PROJECT OBJECTIVE

COMIT Booth adalah aplikasi photobooth yang memungkinkan user:

```text
OPEN COMIT BOOTH
↓
PILIH TEMA / FRAME
↓
PILIH JUMLAH FOTO
↓
1 / 2 / 3 / 4 FOTO
↓
CAMERA
↓
COUNTDOWN
↓
CAPTURE
↓
PHOTO COMPOSER
↓
FRAME
↓
FINAL IMAGE 4:3
↓
PREVIEW
↓
DOWNLOAD
```

Aplikasi harus dapat digunakan melalui laptop/browser.

# 4. MAIN PRINCIPLE

Ada tiga sumber utama dalam project:
1. FIGMA ↓ DESIGN SOURCE
2. EXISTING CODE ↓ FUNCTIONALITY SOURCE
3. USER/DEVELOPER RESOURCES ↓ ASSET + REFERENCE SOURCE

AI harus menggabungkan ketiganya.

# 5. PRIORITY ORDER

Gunakan prioritas berikut:
1. Resource yang diberikan user/developer
2. Asset dari Figma
3. Source code existing
4. Dependency/library existing
5. Dokumentasi resmi
6. Resource eksternal terpercaya
7. Membuat resource baru sendiri

Artinya:
Jika user sudah memberikan Logo, Mascot, Frame, Background, Icon, Screenshot, Design, Source code, Component, Font, Asset...
maka WAJIB diperiksa dan dimanfaatkan terlebih dahulu.
Jangan mengabaikan resource tersebut lalu mencari pengganti di internet.

# 6. RESOURCE AUDIT WAJIB

Sebelum melakukan coding, lakukan audit terhadap seluruh project.
Periksa Project structure, Assets, Fonts, CSS, Camera/Capture logic, Composer, dan Dependencies.
Jangan langsung melakukan rewrite.

# 7. CREATE RESOURCE INVENTORY

Sebelum mengubah project, identifikasi resource yang tersedia.
Jika resource tidak ditemukan, laporkan dan jangan langsung membuat pengganti secara sembarangan.

# 8. FIGMA AS SOURCE OF DESIGN

Figma merupakan sumber utama untuk Layout, Typography, Color, Spacing, Component, Background, Illustration, Animation, dan Visual hierarchy.
Jika UI existing berbeda dengan Figma: Gunakan Figma.
Namun functionality existing tetap dipertahankan.

# 9. FIGMA ACCESS

Figma: [Tautan Figma]
Jika environment coding agent tidak dapat membuka Figma: Gunakan screenshot/export frame/asset Figma yang diberikan developer.
Jangan membuat desain berdasarkan tebakan jika screenshot atau asset tersedia.

# 10. FIGMA IMPLEMENTATION

Jangan menjadikan screenshot Figma sebagai satu gambar penuh website.
JANGAN: `<img src="figma-page.png">` sebagai keseluruhan UI.
LAKUKAN: Figma ↓ React Component ↓ CSS ↓ Real Button. Desain harus benar-benar menjadi UI yang dapat digunakan.

# 11. PIXEL-ACCURATE IMPLEMENTATION

Implementasikan desain sedekat mungkin dengan Figma (Position, Width, Height, Margin, Font size, Hover state, dll). Jika nilai tersedia, gunakan nilai tersebut.

# 12. EXISTING PROJECT MUST BE PRESERVED

Jangan: Delete existing project ↓ Create new project
Jangan rewrite seluruh aplikasi hanya karena desain berubah.
Gunakan: Existing Project ↓ Audit ↓ Reuse ↓ Refactor ↓ Update UI ↓ Improve

# 13. REUSE BEFORE CREATE

Sebelum membuat component/function baru:
SEARCH EXISTING ↓ REUSE ↓ REFACTOR ↓ EXTEND ↓ CREATE NEW

# 14. EXISTING FUNCTIONALITY MUST WORK

Semua functionality berikut wajib tetap berjalan:
Home, Pilih frame/tema, Webcam, Countdown, Capture, Retake, Photo preview, Photo composer, Download.

# 15. USER FLOW

Flow utama:
HOME ↓ SELECT THEME / FRAME ↓ CAMERA ↓ COUNTDOWN ↓ CAPTURE ↓ PHOTO REVIEW ↓ PHOTO COMPOSER ↓ RESULT ↓ DOWNLOAD

# 16-18. SELECT FRAME & PHOTO COUNT

User harus dapat memilih tema/frame sebelum mengambil foto. Setiap pilihan harus memiliki Preview, Hover, dan Active state. Data frame terpilih harus diteruskan sampai ke proses Photo Composer.

# 19-20. CAMERA STREAM SAFETY

Jangan menjalankan beberapa camera stream sekaligus.
Lifecycle: Camera Mount ↓ getUserMedia() ↓ Camera Active ↓ Capture ↓ Camera Cleanup.
Ketika meninggalkan camera, pastikan track di-stop.

# 21-22. COUNTDOWN & CAPTURE

Countdown mengikuti desain Figma (3 2 1 CAPTURE). Foto yang diambil masuk ke satu state array.

# 23-24. RETAKE & PHOTO DATA FLOW

User harus dapat melakukan foto ulang (Retake) tanpa merusak sesi kamera. Gunakan satu alur state.

# 25-26. PHOTO COMPOSER & FINAL OUTPUT

Photo Composer bertugas menggabungkan Captured Photos + Frame Overlay + Logo menjadi Final Canvas.
Pertahankan composer existing. (Catatan: Output disesuaikan dengan template 9:16 portrait atau 4:3 landscape tergantung frame).

# 28-29. ASSET & LOGO POLICY

Gunakan asset asli yang diberikan. Prioritas: User Asset ↓ Figma Asset ↓ Existing Asset.
Jangan mengubah bentuk/distorsi logo.

# 31. NO UNNECESSARY DEPENDENCIES

Jangan install library baru hanya karena terlihat modern. Jika tidak diperlukan, jangan install.

# 32-34. UI FRAMEWORK & CSS ISOLATION

Gunakan styling system existing sebagai prioritas. Hindari CSS conflict dengan menggunakan penamaan class yang jelas atau scoped styling.

# 35-36. STATE MANAGEMENT & ISOLATION

Jangan membuat state duplicate. Gunakan satu source of truth. Batasi perubahan fitur hanya pada area yang relevan.

# 37-38. BEFORE MODIFYING FILE

Baca file, pahami dependensi, dan lakukan change impact analysis sebelum mengubah. Jangan overwrite sembarangan.

# 39-40. RESPONSIVE & PERFORMANCE

Target utama: Laptop / Desktop. Pastikan memory usage dan re-rendering tetap optimal.

# 41-45. SCREEN MAPPING

Sesuaikan screen existing dengan Figma. Jangan mengubah nama rute tanpa alasan. Gunakan mapping yang jelas sebelum implementasi.

# 46-51. TESTING & QA

Lakukan functional test dari awal (Home) hingga akhir (Download) untuk setiap variasi frame. Pastikan tidak ada feature regression dan error handling terpasang dengan baik.

# 52-54. CONFLICT RESOLUTION & NO RANDOM DESIGN CHANGES

Pilih satu sistem terbaik jika terjadi duplikasi fitur. Jangan mengubah desain berlawanan dengan Figma dengan alasan preferensi pribadi.

# 58. DEPLOYMENT

Pastikan `npm run build` sukses dan semua fungsi berjalan sebelum deployment.

# 61-64. AI BEHAVIOR & FINAL ARCHITECTURE

AI coding agent HARUS:
READ ↓ UNDERSTAND ↓ AUDIT ↓ PLAN ↓ REUSE ↓ IMPLEMENT ↓ TEST ↓ FIX ↓ VERIFY

COMIT BOOTH FINAL OBJECTIVE
EXISTING COMIT BOOTH + FINAL FIGMA DESIGN + USER-PROVIDED RESOURCES + EXISTING FUNCTIONALITY + SAFE EXTERNAL RESOURCES WHEN NEEDED
↓
STABLE + BEAUTIFUL + FAST + FUNCTIONAL + CONSISTENT + PRODUCTION-READY COMIT BOOTH
