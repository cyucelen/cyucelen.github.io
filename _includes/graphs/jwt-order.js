;(function() {
  const entities = {
    user: 1,
    ingress: 2,
    auth: 3,
    authDB: 4,
    order: 5
  }

  var nodes = new vis.DataSet([
    { id: entities.user, label: "Kullanıcı", image: "/images/mehmet-amca-jwt.jpg", shape: "image" },
    {
      id: entities.ingress,
      label: "Ingress Gateway",
      shape: "box",
      color: { border: "#fbcf16", background: "#fdfa2e" }
    },
    {
      id: entities.auth,
      label: "Auth (Token Service)",
      shape: "box",
      color: { border: "#c7254e", background: "#e395a9" }
    },
    { id: entities.authDB, label: "Auth DB", shape: "database", color: { border: "#c7254e", background: "#e395a9" } },
    { id: entities.order, label: "Order Service", shape: "box" }
  ])

  var edges = new vis.DataSet([
    {
      from: entities.user,
      to: entities.ingress,
      label: "Siparislerim",
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    },
    {
      from: entities.ingress,
      to: entities.user,
      label: "Siparisler",
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    },
    {
      from: entities.ingress,
      to: entities.order,
      label: "Siparislerim",
      dashes: true,
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    },
    {
      from: entities.order,
      to: entities.ingress,
      label: "Siparisler",
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    },
    {
      from: entities.ingress,
      to: entities.auth,
      label: "Tokeni doğrula",
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    },
    {
      from: entities.auth,
      to: entities.authDB,
      label: "Yetkileri Al",
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    }
  ])

  var container = document.getElementById("jwt-order-architecture")
  var data = {
    nodes: nodes,
    edges: edges
  }
  var options = {
    edges: {
      smooth: {
        forceDirection: "none",
        roundness: 0.65
      }
    },
    physics: {
      enabled: true,
      hierarchicalRepulsion: {
        centralGravity: 0.9,
        springLength: 500,
        nodeDistance: 100
      },
      solver: "repulsion"
    }
  }
  var network = new vis.Network(container, data, options)
})()
