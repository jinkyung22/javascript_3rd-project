//클래스 파일쪼개기생각해봐야함
import { Chef } from "./Chef.js";
import { Menu } from "./Menu.js";
import { Server } from "./Server.js";

//리스트 빈배열로 선언
var orders = [];
var cookings = [];
var servings = [];
var index = 0;

//요리사2명, 서버2명(배열로넣어주기)
var chefs = [new Chef("유림"), new Chef("진하")];
var servers = [new Server("현철", 1000), new Server("일현", 2000)];

//랜더링 공통함수
function renderItems(items, containerId, textCallback) {
  var containerEl = document.getElementById(containerId);
  containerEl.innerHTML = "";
  items.forEach(function (item) {
    var liEl = document.createElement("li");
    liEl.textContent = textCallback(item);
    containerEl.append(liEl);
  });
}

//주문
function renderOrders() {
  renderItems(orders, "orders", function (order) {
    return "Order " + order.orderNumber + ": " + order.menu.name;
  });
}

//요리
function renderCookings() {
  renderItems(cookings, "cookings", function (cooking) {
    return `${
      cooking.menu.orderNumber
    } 메뉴: (${cooking.menu.menu.name}) (${cooking.menu.menu.time / 1000}초) -요리사: ${cooking.chef.name} (${cooking.chef.status})`;
  });
}

//서빙
function renderServings() {
  renderItems(servings, "servings", function (serving) {
    return `${
      serving.menu.orderNumber
    } 메뉴: (${serving.menu.menu.name}) (${serving.menu.menu.time / 1000}초) -서버: ${serving.server.name} (${serving.server.status})`;
  });
}

//대기중인 요리사찾기
//(요리사가 있을 때까지 대기해야 함) > 비동기작업(promise로 해보기) > 여유시간을 줘야 화면이 안뻗음

function findChef() {
  return new Promise(function (resolve) {
    var availableChefs;

    var findchef = setInterval(function () {
      availableChefs = chefs.find(function (chef) {
        return chef.isAvailable();
      });

      if (availableChefs) {
        clearInterval(findchef);
        resolve(availableChefs);
      }
    }, 100); //
  });
}

//대기중인 서버찾기

function findServer() {
  return new Promise(function (resolve) {
    var availableServers;

    var findserv = setInterval(function () {
      availableServers = servers.find(function (server) {
        return server.isAvailable();
      });
      if (availableServers) {
        clearInterval(findserv); // 안그럼 계속 돌아감
        resolve(availableServers);
      }
    }, 100);
  });
}

// 주문, 요리, 서빙의 메인 프로세스는 이 함수에서 전부 처리되어야함(화면이 뻗으면 안됨)
// 비동기 안에 비동기넣으면 콜백지옥 > 어떻게 해결해야할지 생각해보기
function run(menu) {
  var order = {
    orderNumber: index++,
    menu: menu,
  };
  //주문 추가하고 화면렌더링
  orders.push(order);
  renderOrders();

  findChef()
    // 대기 중인 요리사를 찾아서 해당 주문을 요리 목록에 추가하고 화면에 렌더링
    .then(function (chef) {
      console.log(chef);
      cookings.push({ menu: order, chef: chef });
      renderCookings();

      // 주문 목록에서 해당 주문을 제거하고 화면에 렌더링
      var orderIndex = orders.findIndex(function (orderItem) {
        return orderItem.orderNumber === order.orderNumber;
      });
      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        renderOrders();
      }

      // 요리사한테 메뉴 요리하도록 넘김
      return chef.cookAsync(menu);
    })
    .then(function () {
      // 대기 중인 서버를 찾아서 반환
      return findServer();
    })
    .then(function (server) {
      // 요리가 완료된 주문을 요리 목록에서 제거하고 화면에 렌더링
      var cookingIndex = cookings.findIndex(function (cooking) {
        return cooking.menu.orderNumber === order.orderNumber;
      });
      cookings.splice(cookingIndex, 1);
      renderCookings();

      servings.push({ menu: order, server: server });
      renderServings();
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
  run(new Menu("순댓국", 1000));
};

document.getElementById("haejang").onclick = function () {
  run(new Menu("해장국", 2000));
};
