const StoreProductsService = require("../../services/products/store_products.service");
const { product } = require("../../utils/prisma");

class StoreController {
  static async GetProducts(req, res) {
    const products = await StoreProductsService.AllProducts();

    if (products.error) {
      res.status(500).json({
        status: false,
        message: "An error occurred while fetching products",
        error: products.error,
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  }

  static async GetSingleProduct(req, res) {
    const { product_id } = req.params;

    const productDetails = await StoreProductsService.SingleProduct(product_id);

    if (productDetails.error) {
      res.status(404).json({
        status: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      status: true,
      message: "Product fetched successfully",
      data: productDetails,
    });
  }
}

module.exports = StoreController;
