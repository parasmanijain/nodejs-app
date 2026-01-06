import {Router} from 'express';
import { getIndex, getProducts } from '../controllers/shop';

const router = Router();

router.get('/', getIndex);

router.get('/products', getProducts);

// router.get('/products/:productId', shopController.getProduct);

// router.get('/cart', shopController.getCart);

// router.post('/cart', shopController.postCart);

// router.post('/cart-delete-item', shopController.postCartDeleteProduct);

// router.post('/create-order', shopController.postOrder);

// router.get('/orders', shopController.getOrders);

export default router;
