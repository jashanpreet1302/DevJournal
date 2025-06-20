export interface TurtleState {
  x: number;
  y: number;
  angle: number;
  penDown: boolean;
  color: string;
}

export interface TurtleCommand {
  type: "move" | "turn" | "penUp" | "penDown" | "color";
  value?: number;
  color?: string;
}

export class TurtleGraphics {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private turtle: TurtleState;
  private paths: Array<{ x: number; y: number; color: string }[]> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.turtle = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      angle: 0,
      penDown: true,
      color: "#3B82F6",
    };
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.paths = [];
    this.turtle = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      angle: 0,
      penDown: true,
      color: "#3B82F6",
    };
  }

  forward(distance: number) {
    const startX = this.turtle.x;
    const startY = this.turtle.y;

    const radians = (this.turtle.angle * Math.PI) / 180;
    this.turtle.x += Math.cos(radians) * distance;
    this.turtle.y += Math.sin(radians) * distance;

    if (this.turtle.penDown) {
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(this.turtle.x, this.turtle.y);
      this.ctx.strokeStyle = this.turtle.color;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  turn(angle: number) {
    this.turtle.angle += angle;
  }

  penUp() {
    this.turtle.penDown = false;
  }

  penDown() {
    this.turtle.penDown = true;
  }

  setColor(color: string) {
    this.turtle.color = color;
  }

  // Generate learning journey based on data
  drawLearningJourney(data: {
    journalEntries: number;
    bugsResolved: number;
    snippetsAdded: number;
    technologies: string[];
  }) {
    this.clear();

    const colors = {
      journal: "#3B82F6",
      bugs: "#EF4444",
      snippets: "#10B981",
      new_tech: "#F59E0B",
    };

    // Start from center
    this.turtle.x = this.canvas.width / 2;
    this.turtle.y = this.canvas.height / 2;

    // Draw a spiral representing learning progression
    let radius = 5;
    let totalActivities = data.journalEntries + data.bugsResolved + data.snippetsAdded;

    for (let i = 0; i < totalActivities; i++) {
      // Determine color based on activity type
      if (i < data.journalEntries) {
        this.setColor(colors.journal);
      } else if (i < data.journalEntries + data.bugsResolved) {
        this.setColor(colors.bugs);
      } else {
        this.setColor(colors.snippets);
      }

      // Move forward and turn to create spiral
      this.forward(radius * 0.3);
      this.turn(30 + (i * 2)); // Varying turn angle for organic feel

      // Gradually increase radius for growth effect
      radius += 0.8;

      // Add some randomness for organic feel
      if (Math.random() > 0.7) {
        this.turn(Math.random() * 60 - 30);
      }
    }

    // Add technology markers as branches
    data.technologies.forEach((tech, index) => {
      this.penUp();
      const angle = (index * 360) / data.technologies.length;
      const branchRadius = 50 + (index * 10);
      
      this.turtle.x = this.canvas.width / 2 + Math.cos((angle * Math.PI) / 180) * branchRadius;
      this.turtle.y = this.canvas.height / 2 + Math.sin((angle * Math.PI) / 180) * branchRadius;
      
      this.penDown();
      this.setColor(colors.new_tech);
      
      // Draw a small branch for each technology
      for (let j = 0; j < 3; j++) {
        this.forward(15);
        this.turn(45);
      }
    });
  }

  // Predefined patterns
  drawSpiralPattern(iterations: number = 100) {
    this.clear();
    this.setColor("#3B82F6");
    
    for (let i = 0; i < iterations; i++) {
      this.forward(i * 0.5);
      this.turn(91);
    }
  }

  drawTreePattern() {
    this.clear();
    this.drawBranch(100, 0);
  }

  private drawBranch(length: number, depth: number) {
    if (depth > 5 || length < 10) return;

    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6"];
    this.setColor(colors[depth % colors.length]);

    this.forward(length);
    
    // Right branch
    this.turn(30);
    this.drawBranch(length * 0.7, depth + 1);
    this.turn(-30);
    
    // Left branch
    this.turn(-30);
    this.drawBranch(length * 0.7, depth + 1);
    this.turn(30);
    
    // Return to original position
    this.turn(180);
    this.forward(length);
    this.turn(180);
  }

  drawGeometricPattern() {
    this.clear();
    const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    
    for (let i = 0; i < 12; i++) {
      this.penUp();
      this.turtle.x = center.x;
      this.turtle.y = center.y;
      this.turtle.angle = i * 30;
      this.penDown();
      
      this.setColor(`hsl(${i * 30}, 70%, 60%)`);
      
      for (let j = 0; j < 6; j++) {
        this.forward(60);
        this.turn(60);
      }
    }
  }
}
