# Robot-Challenge

เว็บไซต์ลงทะเบียนและรายละเอียดการแข่งขัน **Rescue Line Robot Challenge**  
โรงเรียนเซนต์คาเบรียล (Saint Gabriel's College)

## คุณสมบัติหลัก

- หน้าแรก: รายละเอียดการแข่งขัน สนาม อุปกรณ์ กติกา
- ลงทะเบียนทีม → บันทึก Google Sheets + ส่งอีเมลยืนยันพร้อมรหัสทีม
- ประกาศรายชื่อทีม (เปิด/ปิดได้จากหน้าตั้งค่า)
- ตั้งค่าระบบด้วย PIN (เปิด/ปิดรับสมัคร และประกาศรายชื่อ)

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

ตั้งค่าใน `.env` ตาม `.env.example` (Google Sheets, ADMIN_PASSWORD, SMTP)

## Deploy

แนะนำ deploy บน [Vercel](https://vercel.com) แล้วใส่ environment variables ให้ครบ
