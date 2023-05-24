//서버클래스
export function Server(name, servtime) {
  this.name = name;
  this.servtime = servtime;
  this.status = "ready";
}
Server.prototype.isAvailable = function () {
  return this.status === "ready";
};
Server.prototype.servAsync = function () {
  var self = this;
  return new Promise(function (resolve) {
    self.status = "serving"; // 요리 중 상태로 변경
    setTimeout(function () {
      self.status = "ready"; // 요리가 완료되면 다시 ready 상태로 변경
      resolve();
    }, self.servtime);
  });
};
