var orders = [];

class Order {
  frunction(name) {
    this.name = name;
    this.state = "대기";
  }
}

orders.prototype.renderOrder = function () {
  var ordersEl = document.getElementById("orders");
  ordersEl.innerHTML = "";
  orders.forEach(function (order) {
    var liEl = document.createElement("li");
    liEl.textContent = order.name;
    ordersEl.append(liEl);
  });
};
