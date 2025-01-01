const redis = require("../../libs/redis-store");
const prismaQuery = require("../../utils/prisma");

class StoreProductsService {
  static async AllProducts() {
    try {
      // Wrap redis.get in a Promise
      const cachedProducts = await new Promise((resolve, reject) => {
        redis.get("products", (err, reply) => {
          if (err) return reject(err);
          resolve(reply);
        });
      });

      if (cachedProducts) {
        return JSON.parse(cachedProducts);
      }

      const products = await prismaQuery.product.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          instock: true,
          product_id: true,
          category: {
            select: {
              name: true,
            },
          },
          images: {
            select: {
              id: true,
              image_url: true,
            },
          },
          sizes: {
            select: {
              size: {
                select: {
                  name: true,
                }
              },
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      // Cache the products for 60 seconds
      redis.set("products", JSON.stringify(products), "EX", 60);
      return products;
    } catch (error) {
      return { error: true, message: error.message || "An error occurred" };
    }
  }

  static async SingleProduct(product_id) {
    try {
      const productDetails = await prismaQuery.product.findUnique({
        where: {
          product_id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          instock: true,
          product_id: true,
          category: {
            select: {
              name: true,
            },
          },
          images: {
            select: {
              id: true,
              image_url: true,
            },
          },
          sizes: {
            select: {
              size: {
                select: {
                  name: true,
                }
              },
            },
          },
        },
      });

      if (!productDetails) {
        return { error: true, message: "Product not found", status: 404};
      }

      return productDetails
    } catch (error) {
      return { error: true, message: error.message || "An error occurred" };
    }
  }
}

module.exports = StoreProductsService;
