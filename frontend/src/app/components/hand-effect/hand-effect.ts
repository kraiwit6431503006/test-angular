import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Hands } from '@mediapipe/hands';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

@Component({
  selector: 'hand-effect',
  standalone: true,
  templateUrl: './hand-effect.html',
})
export class HandEffect implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private hands!: Hands;
  private segmentation!: SelfieSegmentation;

  private segmentationMask: HTMLCanvasElement | null = null;

  private isCloning = false;
  private chakraStartTime: number | null = null;
  private isHeartActive = false;
  private heartDuration = 3000; 

  private chakraHoldDuration = 300;
  private cloneDuration = 30000;

  private cloneStartTime: number = 0;
  private cloneGrowDuration = 800;

  async ngAfterViewInit() {
    await this.startCamera();
    this.initSegmentation();
    this.initHandDetection();
  }

  async startCamera() {
    const video = this.videoRef.nativeElement;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    video.srcObject = stream;
    await video.play();
  }

  initSegmentation() {
    this.segmentation = new SelfieSegmentation({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    this.segmentation.setOptions({
      modelSelection: 1,
    });

    this.segmentation.onResults((results: any) => {
      this.segmentationMask = results.segmentationMask;
    });
  }

  initHandDetection() {
    const video = this.videoRef.nativeElement;

    this.hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    this.hands.onResults((results: any) => this.processResults(results));

    const loop = async () => {
      await this.hands.send({ image: video });
      await this.segmentation.send({ image: video });
      requestAnimationFrame(loop);
    };

    loop();
  }

  isShadowCloneSign(left: any, right: any, w: number, h: number): boolean {
  const baseSize = Math.min(w, h); // ใช้ค่าที่เล็กกว่า

  const dist = (a: any, b: any) =>
    Math.sqrt(
      Math.pow((a.x - b.x) * w, 2) +
      Math.pow((a.y - b.y) * h, 2)
    );

  const isExtended = (hand: any) => {
    const d8 = dist(hand[8], hand[0]);
    const d6 = dist(hand[6], hand[0]);
    const d12 = dist(hand[12], hand[0]);
    const d10 = dist(hand[10], hand[0]);
    return d8 > d6 * 1.05 && d12 > d10 * 1.05; // เพิ่ม tolerance
  };

  if (!isExtended(left) || !isExtended(right)) return false;

  // ปรับ threshold ให้เหมาะกับมือถือ
  const intersectionThreshold = baseSize * 0.18;

  const isTouching =
    dist(left[8], right[6]) < intersectionThreshold ||
    dist(left[8], right[7]) < intersectionThreshold ||
    dist(right[8], left[6]) < intersectionThreshold ||
    dist(right[8], left[7]) < intersectionThreshold;

  const getAngle = (hand: any) =>
    Math.atan2(
      (hand[8].y - hand[5].y) * h,
      (hand[8].x - hand[5].x) * w
    );

  const angleLeft = getAngle(left);
  const angleRight = getAngle(right);
  const angleDiff = Math.abs(angleLeft - angleRight);

  // ขยายช่วง angle ให้เหมาะกับมือถือ
  const isCrossed = angleDiff > 0.8 && angleDiff < 2.5;

  return isTouching && isCrossed;
}


  renderClones(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, w: number, h: number) {
    if (!this.segmentationMask) return;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -w, 0, w, h);
    ctx.restore();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(this.segmentationMask, 0, 0, w, h);
    tempCtx.globalCompositeOperation = 'source-in';
    tempCtx.drawImage(video, 0, 0, w, h);

    ctx.save();
    ctx.scale(-1, 1);

    const drawClone = (offsetX: number, liftAmount: number, scale: number) => {
      const newW = w * scale;
      const newH = h * scale;
      const x = -w + offsetX - (newW - w) / 2;
      const y = h - newH - liftAmount;
      ctx.drawImage(tempCanvas, x, y, newW, newH);
    };

    const s3 = 0.45;
    const lift3 = h * 0.3;
    for (let i = 6; i >= 1; i--) {
      drawClone(-i * 120, lift3, s3);
      drawClone(i * 120, lift3, s3);
    }

    const s2 = 0.55;
    const lift2 = h * 0.15;
    for (let i = 4; i >= 1; i--) {
      drawClone(-i * 180, lift2, s2);
      drawClone(i * 180, lift2, s2);
    }

    const s1 = 0.6;
    const lift1 = -0.2;
    for (let i = 4; i >= 1; i--) {
      drawClone(-i * 140, lift1, s1);
      drawClone(i * 140, lift1, s1);
    }

    ctx.drawImage(tempCanvas, -w, 0, w, h);

    ctx.restore();
  }

  processResults(results: any) {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    if (this.isCloning) {
      this.renderClones(ctx, video, w, h);
    }

    const handsDetected = results.multiHandLandmarks;
    const handedness = results.multiHandedness;

    if (!handsDetected) return;

    const HAND_CONNECTIONS = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [9, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [13, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [0, 17],
    ];

    handsDetected.forEach((hand: any) => {
      ctx.strokeStyle = '#FFEB3B';
      ctx.lineWidth = 3;
      HAND_CONNECTIONS.forEach(([i, j]) => {
        const start = hand[i];
        const end = hand[j];
        ctx.beginPath();
        ctx.moveTo(start.x * w, start.y * h);
        ctx.lineTo(end.x * w, end.y * h);
        ctx.stroke();
      });

      hand.forEach((p: any) => {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF9800';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });

    if (!this.isCloning && handsDetected.length === 2 && handedness?.length === 2) {
      let left: any;
      let right: any;

      for (let i = 0; i < 2; i++) {
        if (handedness[i].label === 'Left') {
          left = handsDetected[i];
        } else {
          right = handsDetected[i];
        }
      }

      if (left && right) {
        const isSign = this.isShadowCloneSign(left, right, w, h);
        if (isSign) {
          if (!this.chakraStartTime) this.chakraStartTime = Date.now();
          if (Date.now() - this.chakraStartTime > this.chakraHoldDuration) {
            this.activateClone();
          }
        } else {
          this.chakraStartTime = null;
        }
      }
    }

    if (this.isHeartActive && handsDetected.length === 2) {
    const left = handsDetected.find((_: any, i: number) => handedness[i].label === 'Left');
    const right = handsDetected.find((_: any, i: number) => handedness[i].label === 'Right');
    if (left && right) {
      const midX = ((left[8].x + right[8].x) / 2) * w;
      const midY = ((left[8].y + right[8].y) / 2) * h;
      this.drawHeart(ctx, midX, midY, 40);
    }
  }

  if (handsDetected.length === 2 && handedness?.length === 2) {
    const left = handsDetected.find((_: any, i: number) => handedness[i].label === 'Left');
    const right = handsDetected.find((_: any, i: number) => handedness[i].label === 'Right');

    if (left && right) {
      const isCloneSign = this.isShadowCloneSign(left, right, w, h);
      if (isCloneSign) {
        if (!this.chakraStartTime) this.chakraStartTime = Date.now();
        if (Date.now() - this.chakraStartTime > this.chakraHoldDuration) {
          this.activateClone();
        }
      } else {
        this.chakraStartTime = null;
      }

      if (this.isHeartSign(left, right, w, h)) {
        this.isHeartActive = true;
        setTimeout(() => this.isHeartActive = false, this.heartDuration);
      }
    }
  }
    
  }

  isHeartSign(left: any, right: any, w: number, h: number): boolean {
    const dist = (a: any, b: any) =>
      Math.sqrt(Math.pow((a.x - b.x) * w, 2) + Math.pow((a.y - b.y) * h, 2));

    const topTouch = dist(left[8], right[8]);
    const bottomTouch = dist(left[4], right[4]); 

    const threshold = w * 0.08;
    return topTouch < threshold && bottomTouch < threshold;
  }
  
  drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.save();
    ctx.fillStyle = '#FF0000';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size / 2, x - size, y - size / 2, x - size, y);
    ctx.bezierCurveTo(x - size, y + size / 2, x, y + size, x, y + size * 1.2);
    ctx.bezierCurveTo(x, y + size, x + size, y + size / 2, x + size, y);
    ctx.bezierCurveTo(x + size, y - size / 2, x, y - size / 2, x, y);
    ctx.fill();
    ctx.restore();
  }

  activateClone() {
    if (this.isCloning) return;

    this.isCloning = true;
    this.chakraStartTime = null;
    this.cloneStartTime = Date.now();

    setTimeout(() => {
      this.isCloning = false;
    }, this.cloneDuration);
  }
}
