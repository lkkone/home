console.log('%cCopyright © 2024 likaikai.com',
    'background-color: #ff00ff; color: white; font-size: 24px; font-weight: bold; padding: 10px;'
);
console.log('%c   /\\_/\\', 'color: #8B4513; font-size: 20px;');
console.log('%c  ( o.o )', 'color: #8B4513; font-size: 20px;');
console.log(' %c  > ^ <', 'color: #8B4513; font-size: 20px;');
console.log('  %c /  ~ \\', 'color: #8B4513; font-size: 20px;');
console.log('  %c/______\\', 'color: #8B4513; font-size: 20px;');

document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handlePress(event) {
    this.classList.add('pressed');
}

function handleRelease(event) {
    this.classList.remove('pressed');
}

function handleCancel(event) {
    this.classList.remove('pressed');
}

var buttons = document.querySelectorAll('.projectItem');
buttons.forEach(function (button) {
    button.addEventListener('mousedown', handlePress);
    button.addEventListener('mouseup', handleRelease);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handlePress);
    button.addEventListener('touchend', handleRelease);
    button.addEventListener('touchcancel', handleCancel);
});

function toggleClass(selector, className) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        element.classList.toggle(className);
    });
}

function pop(imageURL) {
    var tcMainElement = document.querySelector(".tc-img");
    if (imageURL) {
        tcMainElement.src = imageURL;
    }
    toggleClass(".tc-main", "active");
    toggleClass(".tc", "active");
}

var tc = document.getElementsByClassName('tc');
var tc_main = document.getElementsByClassName('tc-main');
tc[0].addEventListener('click', function (event) {
    pop();
});
tc_main[0].addEventListener('click', function (event) {
    event.stopPropagation();
});



function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) == 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}















document.addEventListener('DOMContentLoaded', function () {






    // 速度切换按钮：复用右上角 onoffswitch 样式
    var html = document.querySelector('html');
    var tanChiShe = document.getElementById("tanChiShe");






    // 统一为深色视觉；若存在贪吃蛇图片则固定为 Dark 版本
    function applyDarkLook() {
        if (tanChiShe) tanChiShe.src = "./static/svg/snake-Dark.svg";
        html.dataset.theme = "Dark";
        setCookie("themeState", "Dark", 365);
    }







    var Checkbox = document.getElementById('myonoffswitch')
    // 将按钮从主题切换改为速度切换：0.3x <-> 10x
    if (Checkbox) {
        Checkbox.addEventListener('change', function () {
            if (window.starfieldControl && typeof window.starfieldControl.toggleFast === 'function') {
                window.starfieldControl.toggleFast();
            }
        });
    }



    // 强制使用深色外观，保证与星空背景一致
    applyDarkLook();
    if (Checkbox) {
        // 默认最低速 0.3x，对应按钮未选中（按原样式惯例）
        Checkbox.checked = false;
    }

















   

    var fpsElement = document.createElement('div');
    fpsElement.id = 'fps';
    fpsElement.style.zIndex = '10000';
    fpsElement.style.position = 'fixed';
    fpsElement.style.left = '0';
    document.body.insertBefore(fpsElement, document.body.firstChild);

    var showFPS = (function () {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };

        var fps = 0,
            last = Date.now(),
            offset, step, appendFps;

        step = function () {
            offset = Date.now() - last;
            fps += 1;

            if (offset >= 1000) {
                last += offset;
                appendFps(fps);
                fps = 0;
            }

            requestAnimationFrame(step);
        };

        appendFps = function (fpsValue) {
            fpsElement.textContent = 'FPS: ' + fpsValue;
        };

        step();
    })();
    
    
    
    //pop('./static/img/tz.jpg')
    
    
    
});




var pageLoading = document.querySelector("#likaikai-loading");
window.addEventListener('load', function() {
    setTimeout(function () {
        pageLoading.style.opacity = '0';
    }, 100);
});

// 底部模块显示控制
// 开关变量：true = 显示，false = 隐藏
var SHOW_FOOTER = false; // 默认关闭，不显示底部模块

// 控制底部模块显示/隐藏的函数
function toggleFooter() {
    var footer = document.getElementById('footer');
    if (footer) {
        if (SHOW_FOOTER) {
            footer.style.display = 'block';
        } else {
            footer.style.display = 'none';
        }
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    toggleFooter();
});

// 如果需要动态切换，可以调用这个函数
function setFooterVisibility(show) {
    SHOW_FOOTER = show;
    toggleFooter();
}

