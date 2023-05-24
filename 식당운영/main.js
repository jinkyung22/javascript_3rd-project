//클래스 파일쪼개기생각해봐야함

// 메뉴클래스
function Menu(name, time) {
  this.name = name;
  this.time = time;
}

//요리사클래스
function Chef() {
  // 요리사 >> 레디와 쿠킹상태를 가지고, 대기중인지 물어봐야하고, 요리를 시켜야함
  this.status = "ready"; // cooking
}
Chef.prototype.isAvailable = function () {
  return this.status === "ready";
};
// 비동기 함수명에서는 뒤에 Async를 붙여주는 관습이있음
Chef.prototype.cookAsync = function (menu) {
  //에러 안날거라서 에러는 생략, 다음걸 연결하려고 return(비동기함수)
  return new Promise(function (resolve) {
    setTimeout(resolve, menu.time);
  });
};

var orders = [];
var cookings = [];
var servings = [];

//요리사2명(배열로넣어주기)
var chefs = [new Chef(), new Chef()];

// function renderOrders() {
//   var ordersEl = document.getElementById("orders");
//   ordersEl.innerHTML = "";
//   orders.forEach(function (order) {
//     var liEl = document.createElement("li");
//     liEl.textContent = order.name;
//     ordersEl.append(liEl);
//   });
// }

document.getElementById("sundae").onclick = function () {
  // settimeout 넣기
  run(new Menu("순댓국", 1000));
};

document.getElementById("haejang").onclick = function () {
  run(new Menu("해장국", 2000));
};

// 주문, 요리, 서빙의 메인 프로세스는 이 함수에서 전부 처리되어야함
// 화면이 뻗으면 안됨
function run(menu) {
  //주문목록에 추가, 출력
  orders.push(menu);
  renderOrders();

  //대기중인 요리사 찾기(요리사가 있을 때까지 대기해야 함) > 비동기작업(promise로 해보기) > 여유시간을 줘야 화면이 안뻗음
  //findchef도 비동기
  //비동기 안에 비동기넣으면 콜백지옥 > 어떻게 해결해야할지 생각해보기

  findChef().then(function (chef) {});

  //요리사에게 요리시킴
  // -- 요리목록으로 넘어가야함
  chef.cookAsync().then(function () {
    //서빙을 시킴
    // -- 서빙목록으로 넘어가야함
  });
}
