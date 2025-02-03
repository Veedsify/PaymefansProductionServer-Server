const HelpService = require('../../services/help/HelpService');
class HelpContoller{
    static async GetHelpCategories(req, res){
        try {
            const helpCategories = await HelpService.GetHelpCategories();
            res.json(helpCategories);
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
}