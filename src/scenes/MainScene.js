export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    // 리소스를 불러와 로드하는 메서드
    preload() {
        const basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
        const images = `${basePath}/images`;

        this.load.image('background', `${images}/background.png`);
    }

    // 불러온 리소스를 활용해 게임 요소를 정의하는 메서드
    create() {
        // 로드된 이미지를 배경으로 추가
        this.background = this.physics.add.sprite(640, 350, 'background');
    }
}
