;(function() {
  const entities = {
    user: 1,
    login: 2,
    ingress: 3,
    auth: 4,
    userDB: 5,
    authDB: 6
  }

  var nodes = new vis.DataSet([
    { id: entities.user, label: "Kullanıcı", image: "/images/mehmet-amca-jwt.jpg", shape: "image" },
    { id: entities.login, label: "Login Service", shape: "box", color: { border: "#1faf5b", background: "#6bda4f" } },
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
    {
      id: entities.userDB,
      label: "User Credential DB",
      shape: "database",
      color: { border: "#1faf5b", background: "#6bda4f" }
    },
    { id: entities.authDB, label: "Auth DB", shape: "database", color: { border: "#c7254e", background: "#e395a9" } }
  ])

  var edges = new vis.DataSet([
    { from: entities.user, to: entities.ingress, label: "Login", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    { from: entities.ingress, to: entities.user, label: "Token", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    { from: entities.login, to: entities.ingress, label: "Token", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    { from: entities.ingress, to: entities.login, label: "Login", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    { from: entities.login, to: entities.userDB, label: "Doğrula", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    { from: entities.login, to: entities.auth, label: "Token iste", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    { from: entities.auth, to: entities.login, label: "Token", arrows: { to: { scaleFactor: 1, type: "arrow" } } },
    {
      from: entities.auth,
      to: entities.authDB,
      label: "User yetkilerini al",
      arrows: { to: { scaleFactor: 1, type: "arrow" } }
    }
  ])

  var container = document.getElementById("jwt-login-architecture")
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
