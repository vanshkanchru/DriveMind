let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;
};

const emitRiskAlert = (alertData) => {
  if (!ioInstance) {
    console.log("Socket.IO not initialized. Risk alert not emitted.");
    return;
  }

  ioInstance.emit("risk-alert", alertData);
};

module.exports = {
  initSocket,
  emitRiskAlert
};