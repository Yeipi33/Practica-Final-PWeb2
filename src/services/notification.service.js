//listeners

this.on('user:verified', (user) => {
  console.log(`[EVENT] user:verified → ${user.email}`);
});

this.on('user:invited', (user) => {
  console.log(`[EVENT] user:invited → ${user.email}`);
});

this.on('user:deleted', (user) => {
  console.log(`[EVENT] user:deleted → ${user.email}`);
});