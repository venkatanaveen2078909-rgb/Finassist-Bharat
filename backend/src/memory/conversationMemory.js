const memory = [];

export const saveMessage = (role, text) => {
  memory.push({
    role,
    text,
    time: new Date().toISOString(),
  });
};

export const getMemory = () => {
  return memory.slice(-10);
};

export const clearMemory = () => {
  memory.length = 0;
};