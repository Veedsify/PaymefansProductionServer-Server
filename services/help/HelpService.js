const prismaQuery = require('../../utils/prisma')

class HelpService {
    static async HelpCategories() {
        try {
            return await prismaQuery.helpCategory.findMany();
        } catch (error) {
           return {
               error: true,
               message: error.message
           }
        }
    }
}


module.exports = HelpService
