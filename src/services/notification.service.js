this.on('user:verified', (user) => {
  console.log(`[EVENT] user:verified → ${user.email}`);
});