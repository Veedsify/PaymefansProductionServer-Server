const prismaQuery = require("../../utils/prisma");

async function addView(req) {
  try {
    const updateView = await prismaQuery.liveStreamView.create({
      data: {
        live_id: 1,
        user_id: user_id,
      },
    });
  } catch (err) {
    console.log(err);
    return {
      error: true,
      message: err.message,
    };
  }
}

module.exports = { addView };
