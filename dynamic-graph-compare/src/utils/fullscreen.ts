// 进入全屏
export function enter(ele: HTMLElement | any) {
  if (ele.mozRequestFullScreen) ele.mozRequestFullScreen();
  if (ele.webkitRequestFullscreen) ele.webkitRequestFullscreen();
  if (ele.msRequestFullscreen) ele.msRequestFullscreen();
  if (ele.fullscreenEnabled) ele.fullscreenEnabled();
}

// 退出全屏
export function exit() {
  if ((document as any).mozCancelFullScreen)
    (document as any).mozCancelFullScreen();
  if ((document as any).webkitExitFullscreen)
    (document as any).webkitExitFullscreen();
  if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
  if ((document as any).exitFullscreen) (document as any).exitFullscreen();
}

// 全屏元素
export function fullEle() {
  return (
    document.fullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).webkitFullScreenElement ||
    (document as any).msFullScreenElement ||
    null
  );
}

// 检测当前是否在全屏状态
export function isFull() {
  return !!fullEle();
}

// 暴露函数
export function toggle(ele: any) {
  console.log(isFull());

  isFull() ? exit() : enter(ele);
}
