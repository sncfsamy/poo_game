let canvas, ctx, player, modal, score = 0, projectiles = [], enemies = [], particles = [], animationId, scoreH, startButton, shoots, hits, nom_joueur = "Player", scoresDiv, ennemiesInterval;

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x + projectile.radius > canvas.width ||
      projectile.y - projectile.radius < 0 ||
      projectile.y + projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
    projectile.update();
  });
  enemies.forEach((enemy, enemyIndex) => {
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      if (distance - projectile.radius - enemy.radius <= 0) {
        hits++;
        for (let i = 0; i < 8; i++) {
            particles.push(
              new Particle(
                projectile.x,
                projectile.y,
                Math.random() * (3 - 1) + 1,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * 3,
                  y: (Math.random() - 0.5) * 3,
                }
              )
            );
          }
        if (enemy.radius - 10 > 5) {
            gsap.to(enemy, {
                radius: enemy.radius - 10,
            });
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0);
        } else {
            score += 10;
            scoreH.innerText = "Score : " + score;
            setTimeout(() => {
                enemies.splice(enemyIndex, 1);
                projectiles.splice(projectileIndex, 1);
            }, 0);
        }
      }
    });

    const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distPlayerEnemy - enemy.radius - player.radius <= 0) {
        cancelAnimationFrame(animationId);
        finDuJeu(score);
    }
    enemy.update();
  });
}

function spawnEnemies() {
  ennemiesInterval = setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    r = r > 10 ? r : 10;
    g = g > 10 ? g : 10;
    b = b > 10 ? b : 10;
    const color = `rgb(${r}, ${g}, ${b})`;
    const randomValue = Math.random();
    let x ,y;
    if (randomValue < 0.25) {
        x = 0 - radius;
        y = Math.random() * canvas.height;
    } else if (randomValue >= 0.25 && randomValue < 0.5) {
        x = canvas.width + radius;
        y = Math.random() * canvas.height;
    } else if (randomValue >= 0.5 && randomValue < 0.75) {
        x = Math.random() * canvas.width;
        y = 0 - radius;
    } else if (randomValue >= 0.75) {
        x = Math.random() * canvas.width;
        y = canvas.height + radius;
    }
    const angle = Math.atan2(player.y - y, player.x - x);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

class Entity {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = "red";
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Player extends Entity{
    constructor(x, y, radius, color) {
        super(x, y, radius);
        this.color = color;
    }
}
class Projectile extends Player {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color);
        this.velocity = velocity;
    }
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy extends Projectile {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity);
    }
}

class Particle extends Enemy {
    constructor(x, y, radius, color, velocity) {
      super(x, y, radius, color, velocity);
      this.alpha = 1;
    }
  
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  
    update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
      this.alpha -= 0.01;
    }
  }
window.addEventListener("DOMContentLoaded", ()=>{
    canvas = document.getElementById("game-container");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2, false);
    ctx.fillStyle = "red";
    ctx.fill();
    player = new Player(canvas.width / 2, canvas.height / 2, 10, "red");
    player.draw();
    modal = document.querySelector("dialog");
    scoreH = document.querySelector("h2");
    scoresDiv = document.getElementById("scores");
    startButton = document.getElementById("start");
    startButton.addEventListener("click", function() {
        modal.close();
        startButton.disabled = true;
        start();
    });
    window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2, false);
        ctx.fillStyle = "red";
        ctx.fill();
    });
    startButton.disabled = false;
});

function finDuJeu(score) {
  clearInterval(ennemiesInterval);
  fetch('https://www.gloriousrp.fr/poogame-billou/scores.php', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "pushscores": "yes", "name": nom_joueur, "score": score })
  })
  .then(async response => {
    const request = new Request("https://www.gloriousrp.fr/poogame-billou/scores.php");
    const reply = await fetch(request);
    const scores = await reply.json();
    scoresDiv.innerHTML = "<br /><br />High Scores:<br />";
    scores.forEach((element, i) => {
      for (let el in element) {
        scoresDiv.innerHTML += "<span class=\"boldy\">" + (i+1) + " - " + el + " - <b>" + element[el] + "</b></span><br />";
      }
    });
  });
    
  window.removeEventListener("click", jeuClick);
  document.getElementById("score").innerHTML = "<br />Score: <b>" + score + "</b><br />Shoots: <b>" + shoots + "</b><br />Hits: <b>" + hits + "</B><br />Précision: <b>" + (Math.round((hits/shoots + Number.EPSILON) * 100)) + "%</b><br /><br /><br />";
  modal.show();
  projectiles = [];
  enemies = [];
  particles = [];
  setTimeout(()=>{ 
      startButton.disabled = false; 
  }, 1000);
}

function start() {
    score = 0;
    hits = 0;
    shoots = 0;
    scoresDiv.innerHTML = "";
    document.getElementById("score").innerHTML = "";
    scoreH.innerText = "Score : 0";
    while (nom_joueur == "Player" || nom_joueur == "" || nom_joueur == undefined || nom_joueur == null) {
      nom_joueur = prompt("Entrez votre nom");
    }
    spawnEnemies();
    animate();
    setTimeout(() => {
        window.addEventListener("click", jeuClick);
    }, 500);
}

function jeuClick(event) {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };

    const projectile = new Projectile(
        player.x,
        player.y,
        5,
        "white",
        velocity
    );
    shoots++;
    projectiles.push(projectile);
    projectile.draw();
}