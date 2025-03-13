const GetUsersService = async () => {
     try {
          return await User.find();
     } catch (error) {
          throw new Error(error);
     }
}

module.exports = GetUsersService;
