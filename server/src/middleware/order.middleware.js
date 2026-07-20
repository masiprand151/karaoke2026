const prisma = require("../configs/prisma");

const paidProtected = (req, res, next) => {
  const { sessionId } = req.body || req.params;
  try {
    const session = await prisma.session.findUnique({
      where: {
        id: Number(sessionId)
      },
      include: {
        transaction: true
      }
    });

    console.log(session);
    
  } catch (error) {
    next(error)
  }
};
