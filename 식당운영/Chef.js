//요리사클래스 >> 레디와 쿠킹상태를 가지고, 대기중인지 물어봐야하고, 요리를 시켜야함
export function Chef(name) {
  this.name = name;
  this.status = "ready"; // cooking
}
Chef.prototype.isAvailable = function () {
  return this.status === "ready";
};

// 비동기 함수명에서는 뒤에 Async를 붙여주는 관습이있음
//에러 안날거라서 에러는 생략
Chef.prototype.cookAsync = function (menu) {
  var self = this;
  self.status = "cooking"; // 요리 중 상태로 변경
  return new Promise(function (resolve) {
    setTimeout(function () {
      self.status = "ready"; // 요리가 완료되면 다시 available 상태로 변경
      resolve();
    }, menu.time);
  });
};
