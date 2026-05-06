import bcryptjs from 'bcryptjs';


export const encrypt = async (clearPassword) => {
  const hash = await bcryptjs.hash(clearPassword, 10);
  return hash;
};

export const compare = async (clearPassword, hashedPassword) => {
  const result = await bcryptjs.compare(clearPassword, hashedPassword);
  return result;
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, deleted: false }).select('+password');

  if (!user) throw AppError.unauthorized('Credenciales inválidas');

  const isMatch = await compare(password, user.password);
  if (!isMatch) throw AppError.unauthorized('Credenciales inválidas');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      status: user.status,
      role: user.role,
    },
  });
};