const HelpService = require('../../services/help/HelpService');
class HelpController {
    static async GetHelpCategories(req, res){
        try {
            const helpCategories = await HelpService.HelpCategories();
            if(helpCategories.error){
                return res.status(500).json({error: helpCategories.message});
            }
            res.json(helpCategories);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}

module.exports = HelpController;