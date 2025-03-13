const GetUsersService = require("../../services/admin/users/user.service");

class UserController {
  static async getUsers(req, res) {
    const users = await GetUsersService();
    if (users.error) {
      return res
        .status(500)
        .json({ error: users.error, message: "Error getting users" });
    }
    return res.status(200).json({ users });
  }
}

module.exports = UserController;
