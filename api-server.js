import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

const PRODUCTS_FILE = './products.json';

app.use(cors());
app.use(express.json());

const readProducts = () => {
  if (fs.existsSync(PRODUCTS_FILE)) {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  }
  return [];
};

const writeProducts = (products) => {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
};

app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.post('/api/products', upload.single('photo'), (req, res) => {
  const products = readProducts();
  const { name, price, desc, cat } = req.body;
  const imgUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : '';
  const newProduct = { name, price: parseFloat(price), desc, cat, img: imgUrl };
  products.push(newProduct);
  writeProducts(products);
  res.json({ success: true, product: newProduct });
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
