const stripe = require("stripe")(process.env.STRIPE_KEY);

("use strict");

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { email, userId, products } = await ctx.request.body;
    const lineItems = await Promise.all(
      products.map(async (product) => {
        const item = await strapi
          .service("api::prodect.prodect")
          .findOne(product.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: parseInt(product.Quantity),
        };
      })
    );
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.YOUR_DOMAIN}/success/true`,
        cancel_url: `${process.env.YOUR_DOMAIN}/success/false`,
        line_items: lineItems,
      });

      await strapi.service("api::order.order").create({
        data: {
          products,
          email,
          userId,
          stripeId: session.id,
        },
      });
      return {
        stripeSession: session,
      };
    } catch (err) {
      ctx.response.status = 500;
      return err;
    }
  },
}));
