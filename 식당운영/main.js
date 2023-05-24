//클래스 파일쪼개기생각해봐야함

// 메뉴클래스 >> 메뉴명, 시간을 가진다.
function Menu(name, time) {
  this.name = name;
  this.time = time;
}

//요리사클래스 >> 레디와 쿠킹상태를 가지고, 대기중인지 물어봐야하고, 요리를 시켜야함
function Chef(name) {
  this.name = name;
  this.status = "ready"; // cooking
}
Chef.prototype.isAvailable = function () {
  return this.status === "ready";
};
// 비동기 함수명에서는 뒤에 Async를 붙여주는 관습이있음
//에러 안날거라서 에러는 생략
Chef.prototype.cookAsync = function (menu) {
  return new Promise(function (resolve) {
    setTimeout(resolve, menu.time);
  });
};

//서버클래스
function Server(name, servtime) {
  this.name = name;
  this.servtime = servtime;
  this.status = "ready";
}
Server.prototype.isAvailable = function () {
  return this.status === "ready";
};
Server.prototype.servAsync = function (server) {
  return new Promise(function (resolve) {
    setTimeout(resolve, server.servtime);
  });
};

//리스트 빈배열로 선언
var orders = [];
var cookings = [];
var servings = [];

//요리사2명, 서버2명(배열로넣어주기)
var chefs = [new Chef("유림"), new Chef("진하")];
var servers = [new Server("현철", 1000), new Server("일현", 2000)];

//주문
function renderOrders() {
  var ordersEl = document.getElementById("orders");
  ordersEl.innerHTML = "";
  orders.forEach(function (order) {
    var liEl = document.createElement("li");
    liEl.textContent = "Order " + order.orderNumber + ": " + order.menu.name;
    ordersEl.append(liEl);
  });
}
//요리
function renderCookings() {
  var cookingsEl = document.getElementById("cookings");
  cookingsEl.innerHTML = "";
  cookings.forEach(function (cooking) {
    var liEl = document.createElement("li");
    liEl.textContent = `${cooking.menu.orderNumber} 메뉴: (${
      cooking.menu.menu.name
    }) (${cooking.menu.menu.time / 1000}초) -요리사: ${cooking.chef.name} (${
      cooking.chef.status
    })`;
    cookingsEl.append(liEl);
  });
}

//서빙
function renderServings() {
  var servingsEl = document.getElementById("servings");
  servingsEl.innerHTML = "";
  servings.forEach(function (serving) {
    var liEl = document.createElement("li");
    liEl.textContent = `${serving.menu.orderNumber} 메뉴: (${
      serving.menu.menu.name
    }) (${serving.menu.menu.time / 1000}초) -서버: ${serving.server.name} (${
      serving.server.status
    })`;
    servingsEl.append(liEl);
  });
}

//대기중인 요리사찾기
//(요리사가 있을 때까지 대기해야 함) > 비동기작업(promise로 해보기) > 여유시간을 줘야 화면이 안뻗음
var chefIndex = 0;
function findChef() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      var availableChefs = chefs.filter(function (chef) {
        return chef.isAvailable();
      });
      if (availableChefs.length > 0) {
        var chef = availableChefs[chefIndex];
        chefIndex = (chefIndex + 1) % chefs.length; // 다음 요리사 선택
        resolve(chef);
      } else {
        reject("대기 중인 요리사가 없습니다.");
      }
    }, 1000); //
  });
}

//대기중인 서버찾기
var serverIndex = 0;
function findServer() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      var availableServers = servers.filter(function (server) {
        return server.isAvailable();
      });
      if (availableServers.length > 0) {
        var server = availableServers[serverIndex];
        serverIndex = (serverIndex + 1) % servers.length; // 다음 서버 선택
        resolve(server);
      } else {
        reject("대기 중인 서버가 없습니다.");
      }
    }, 100);
  });
}

// 주문, 요리, 서빙의 메인 프로세스는 이 함수에서 전부 처리되어야함(화면이 뻗으면 안됨)
// 비동기 안에 비동기넣으면 콜백지옥 > 어떻게 해결해야할지 생각해보기
function run(menu) {
  var order = {
    orderNumber: orders.length + 1,
    menu: menu,
  };
  //주문 추가하고 화면렌더링
  orders.push(order);
  renderOrders();

  findChef()
    // 대기 중인 요리사를 찾아서 해당 주문을 요리 목록에 추가하고 화면에 렌더링
    .then(function (chef) {
      cookings.push({ menu: order, chef: chef });
      renderCookings();

      // 요리사한테 메뉴 요리하도록 넘김
      return chef.cookAsync(menu);
    })
    .then(function () {
      // 주문 목록에서 해당 주문을 제거하고 화면에 렌더링
      var orderIndex = orders.findIndex(function (orderItem) {
        return orderItem.orderNumber === order.orderNumber;
      });
      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        renderOrders();
      }

      // 요리가 완료된 주문을 요리 목록에서 제거하고 화면에 렌더링
      var cookingIndex = cookings.findIndex(function (cooking) {
        return cooking.menu.orderNumber === order.orderNumber;
      });
      cookings.splice(cookingIndex, 1);
      renderCookings();

      // 대기 중인 서버를 찾아서 반환
      return findServer();
    })
    .then(function (server) {
      // 대기 중인 서버를 찾아서 해당 주문을 서빙 목록에 추가하고 화면에 렌더링
      servings.push({ menu: order, server: server });
      renderServings();

      // 서버에게 주문을 서빙하도록 비동기 실행하고 결과를 반환
      return server.servAsync(server);
    })
    .then(function () {
      // 서빙이 완료된 주문을 서빙 목록에서 제거하고 화면에 렌더링
      var servingIndex = servings.findIndex(function (serving) {
        return serving.menu.orderNumber === order.orderNumber;
      });
      servings.splice(servingIndex, 1);
      renderServings();
    })
    .catch(function (error) {
      console.log(error);
    });
}

document.getElementById("sundae").onclick = function () {
  //setTimeout넣기
  setTimeout(function () {
    run(new Menu("순댓국", 1000));
  }, 100);
};

document.getElementById("haejang").onclick = function () {
  setTimeout(function () {
    run(new Menu("해장국", 2000));
  }, 100);
};
