//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    final: 0, //历史最高分
    score: 0, //本次得分
    RN: 4, //总行数
    CN: 4, //总列数
    startX: null, //手机端位置记录--x
    startY: null, //手机端位置记录--y
    endX: null, //手机端位置记录--x
    endY: null, //手机端位置记录--y
    cData: [], //真实数据
    end_pop: false, //结束弹窗
    setting_pop: false //设置弹窗
  },
  showSetting: function() { //打开设置弹窗
    this.setData({
      setting_pop: true
    });
  },
  closeSetting: function() { //关闭设置弹窗
    this.setData({
      setting_pop: false
    });
  },
  backMain: function() { //返回首页
    wx.redirectTo({
      url: '../login/login'
    });
  },
  onLoad: function() { //生命周期函数--监听页面加载
    this.init();
  },
  onHide: function() { //生命周期函数--监听页面隐藏,退到后台
    this.showSetting();
  },
  init: function() { //初始化
    this.data.cData = [];
    for (var x = 0; x < this.data.RN; x++) {
      for (var y = 0; y < this.data.CN; y++) {
        this.data.cData.push({
          score: 0,
          row: x
        });
      }
    }
    this.setData({
      setting_pop: false,
      end_pop: false,
      score: 0,
      cData: this.data.cData
    });
    this.randomNum(); //随机生成1个数
    this.randomNum(); //随机生成1个数
    this.randomNum(); //随机生成1个数
  },
  randomNum: function() { //空位置随机生成1个--2或者4
    while (true) {
      var x = Math.floor(Math.random() * this.data.RN),
        y = Math.floor(Math.random() * this.data.CN);
      if (this.data.cData[x * this.data.RN + y].score === 0) {
        this.data.cData[x * this.data.RN + y].score = Math.random() < 0.3 ? 4 : 2;
        this.setData({
          cData: this.data.cData
        });
        break;
      }
    }
  },
  touchStart: function(event) { //开始移动
    this.setData({
      startX: event.touches[0].pageX,
      startY: event.touches[0].pageY
    });
  },
  touchMove: function(event) { //开始中
    this.setData({
      endX: event.touches[0].pageX,
      endY: event.touches[0].pageY
    });
  },
  touchEnd: function(event) { //开始结束
    this.checkDirection();
  },
  checkDirection: function() { //移动端判断移动方向
    console.log('移动检测')
    var gapWidth = this.data.endX - this.data.startX, //x差值
      gapHeight = this.data.endY - this.data.startY, //y差值
      direction; //方向
    if ((this.data.endX === null && this.data.endY === null) || (Math.abs(gapWidth) < 10 && Math.abs(gapHeight) < 10)) { //移动小于10px忽略动作
      direction = 0;
    } else {
      if (gapWidth > 0) { //坐标轴右边
        if (gapHeight > 0) { //坐标轴右下
          if (gapWidth > gapHeight) {
            direction = 4;
          } else if (gapWidth < gapHeight) {
            direction = 2;
          } else {
            direction = Math.random() < 0.5 ? 4 : 2;
          }
        } else { //坐标轴右上
          gapHeight = Math.abs(gapHeight);
          if (gapWidth > gapHeight) {
            direction = 4;
          } else if (gapWidth < gapHeight) {
            direction = 1;
          } else {
            direction = Math.random() < 0.5 ? 4 : 1;
          }
        }
      } else { //坐标轴左边
        gapWidth = Math.abs(gapWidth);
        if (gapHeight > 0) { //坐标轴左下
          if (gapWidth > gapHeight) {
            direction = 3;
          } else if (gapWidth < gapHeight) {
            direction = 2;
          } else {
            direction = Math.random() < 0.5 ? 3 : 2;
          }
        } else { //坐标轴左上
          gapHeight = Math.abs(gapHeight);
          if (gapWidth > gapHeight) {
            direction = 3;
          } else if (gapWidth < gapHeight) {
            direction = 1;
          } else {
            direction = Math.random() < 0.5 ? 3 : 1;
          }
        }
      }
    }
    this.setData({
      startX: null,
      startY: null,
      endX: null,
      endY: null,
    });
    switch (direction) {
      case 0: //移动还--不动
        break;
      case 1: //移动端--向上
        this.moveTop();
        break;
      case 2: //移动端--向下
        this.moveBottom();
        break;
      case 3: //移动端--向左
        this.moveLeft();
        break;
      case 4: //移动端--向右
        this.moveRight();
        break;
    }
  },
  moveTop: function() { //上移
    var before = JSON.stringify(this.data.cData); //记录上移前的数组，并转化为字符串
    for (var y = 0; y < this.data.CN; y++) {
      this.moveTopInRow(y);
    }
    this.setData({
      cData: this.data.cData,
      score: this.data.score
    });
    var after = JSON.stringify(this.data.cData); //记录上移后的数组，并转化为字符串
    if (before !== after) { //若产生移动 则进行下面操作
      this.randomNum();
      if (this.data.score > this.data.final) {
        this.setData({
          final: this.data.score
        });
      }
      var gameOver = this.end();
      if (gameOver === 1) {
        this.endTime();
      }
    }
  },
  moveTopInRow: function(y) { //上移第y列
    for (var x = 0; x < (this.data.RN - 1); x++) { //遍历全部行 到倒数第二个位置
      var nextX = this.topGetNext(x, y);
      if (nextX !== -1) { //若有非0数字
        if (this.data.cData[x * this.data.CN + y].score === this.data.cData[nextX * this.data.CN + y].score) { //若两个数字相同，相加并且将原位置置为0
          this.data.cData[x * this.data.CN + y].score *= 2;
          this.data.cData[nextX * this.data.CN + y].score = 0;
          this.data.score += this.data.cData[x * this.data.CN + y].score; //加分
        } else {
          if (this.data.cData[x * this.data.CN + y].score !== 0) { //若该位置不为0
            if ((x + 1) !== nextX) { //该位置下的1位与遍历来的next位置不是一个位置，将其下面的数字换位第一个非0数，并将原位置置为0
              this.data.cData[(x + 1) * this.data.CN + y].score = this.data.cData[nextX * this.data.CN + y].score;
              this.data.cData[nextX * this.data.CN + y].score = 0;
            }
          } else { //若该位置是0 ，将下面非0数的挪到上边，并且从该位置出发再遍历一次
            this.data.cData[x * this.data.CN + y].score = this.data.cData[nextX * this.data.CN + y].score;
            this.data.cData[nextX * this.data.CN + y].score = 0;
            x--;
          }
        }
      } else {
        break;
      }
    }
  },
  topGetNext: function(x, y) { //上移--获取x行y列下的第一个非0的位置
    for (var nextX = (x + 1); nextX < this.data.RN; nextX++) {
      if (this.data.cData[nextX * this.data.CN + y].score !== 0) {
        return nextX;
      }
    }
    return -1;
  },
  moveBottom: function() { //下移
    var before = JSON.stringify(this.data.cData); //记录下移前的数组，并转化为字符串
    for (var y = 0; y < this.data.CN; y++) {
      this.moveBottomInRow(y);
    }
    this.setData({
      cData: this.data.cData,
      score: this.data.score
    });
    var after = JSON.stringify(this.data.cData); //记录下移后的数组，并转化为字符串
    if (before !== after) { //若产生移动 则进行下面操作
      this.randomNum();
      if (this.data.score > this.data.final) {
        this.setData({
          final: this.data.score
        });
      }
      var gameOver = this.end();
      if (gameOver === 1) {
        this.endTime();
      }
    }
  },
  moveBottomInRow: function(y) { //下移第y列
    for (var x = (this.data.RN - 1); x > 0; x--) { //遍历全部行 到正数第二个位置
      var prevX = this.bottomGetNext(x, y);
      if (prevX !== -1) { //若有非0数字
        if (this.data.cData[x * this.data.CN + y].score === this.data.cData[prevX * this.data.CN + y].score) { //若两个数字相同，相加并且将原位置置为0
          this.data.cData[x * this.data.CN + y].score *= 2;
          this.data.cData[prevX * this.data.CN + y].score = 0;
          this.data.score += this.data.cData[x * this.data.CN + y].score; //加分
        } else {
          if (this.data.cData[x * this.data.CN + y].score !== 0) { //若该位置不为0
            if ((x - 1) !== prevX) { //该位置上的1位与遍历来的next位置不是一个位置，将其上面的数字换为第一个非0数，并将原位置置为0
              this.data.cData[(x - 1) * this.data.CN + y].score = this.data.cData[prevX * this.data.CN + y].score;
              this.data.cData[prevX * this.data.CN + y].score = 0;
            }
          } else { //若该位置是0 ，将上面非0数的挪到下边，并且从该位置出发再遍历一次
            this.data.cData[x * this.data.CN + y].score = this.data.cData[prevX * this.data.CN + y].score;
            this.data.cData[prevX * this.data.CN + y].score = 0;
            x++;
          }
        }
      } else {
        break;
      }
    }
  },
  bottomGetNext: function(x, y) { //下移--获取x行y列上的第一个非0的位置
    for (var prevX = (x - 1); prevX >= 0; prevX--) {
      if (this.data.cData[prevX * this.data.CN + y].score !== 0) {
        return prevX;
      }
    }
    return -1;
  },
  moveLeft: function() { //左移
    var before = JSON.stringify(this.data.cData); //记录左移前的数组，并转化为字符串
    for (var x = 0; x < this.data.RN; x++) {
      this.moveLeftInRow(x);
    }
    this.setData({
      cData: this.data.cData,
      score: this.data.score
    });
    var after = JSON.stringify(this.data.cData); //记录左移后的数组，并转化为字符串
    if (before !== after) { //若产生移动 则进行下面操作
      this.randomNum();
      if (this.data.score > this.data.final) { //检查是否打破记录
        this.setData({
          final: this.data.score
        });
      }
      var gameOver = this.end();
      if (gameOver === 1) {
        this.endTime();
      }
    }
  },
  moveLeftInRow: function(x) { //左移第x行
    for (var y = 0; y < (this.data.CN - 1); y++) { //遍历全部列 到倒数第二个位置
      var nextY = this.leftGetNext(x, y);
      if (nextY !== -1) { //若有非0数字
        if (this.data.cData[x * this.data.CN + y].score === this.data.cData[x * this.data.CN + nextY].score) { //若两个数字相同，相加并且将原位置置为0
          this.data.cData[x * this.data.CN + y].score *= 2;
          this.data.cData[x * this.data.CN + nextY].score = 0;
          this.data.score += this.data.cData[x * this.data.CN + y].score; //加分
        } else {
          if (this.data.cData[x * this.data.CN + y].score !== 0) { //若该位置不为0
            if ((y + 1) !== nextY) { //该位置后的1位与遍历来的next位置不是一个位置，将其后面的数字换为第一个非0数，并将原位置置为0
              this.data.cData[x * this.data.CN + (y + 1)].score = this.data.cData[x * this.data.CN + nextY].score;
              this.data.cData[x * this.data.CN + nextY].score = 0;
            }
          } else { //若该位置是0，将后面非0数的挪到前边，并且从该位置出发再遍历一次
            this.data.cData[x * this.data.CN + y].score = this.data.cData[x * this.data.CN + nextY].score;
            this.data.cData[x * this.data.CN + nextY].score = 0;
            y--;
          }
        }
      } else {
        break;
      }
    }
  },
  leftGetNext: function(x, y) { //左移--获取x行y列后的第一个非0的位置
    for (var nextY = (y + 1); nextY < this.data.CN; nextY++) {
      if (this.data.cData[x * this.data.CN + nextY].score !== 0) {
        return nextY;
      }
    }
    return -1;
  },
  moveRight: function() { //右移
    var before = JSON.stringify(this.data.cData); //记录右移前的数组，并转化为字符串
    for (var x = 0; x < this.data.RN; x++) {
      this.moveRightInRow(x);
    }
    this.setData({
      cData: this.data.cData,
      score: this.data.score
    });
    var after = JSON.stringify(this.data.cData); //记录右移后的数组，并转化为字符串
    if (before !== after) { //若产生移动 则进行下面操作
      this.randomNum();
      if (this.data.score > this.data.final) {
        this.setData({
          final: this.data.score
        });
      }
      var gameOver = this.end();
      if (gameOver === 1) {
        this.endTime();
      }
    }
  },
  moveRightInRow: function(x) { //右移第x行
    for (var y = (this.data.CN - 1); y > 0; y--) { //遍历全部列 到正数第二个位置
      var prevY = this.rightGetNext(x, y);
      if (prevY !== -1) { //若有非0数字
        if (this.data.cData[x * this.data.CN + y].score === this.data.cData[x * this.data.CN + prevY].score) { //若两个数字相同，相加并且将原位置置为0
          this.data.cData[x * this.data.CN + y].score *= 2;
          this.data.cData[x * this.data.CN + prevY].score = 0;
          this.data.score += this.data.cData[x * this.data.CN + y].score; //加分
        } else {
          if (this.data.cData[x * this.data.CN + y].score !== 0) { //若该位置不为0
            if ((y - 1) !== prevY) { //该位置前的1位与遍历来的next位置不是一个位置，将其前面的数字换为第一个非0数，并将原位置置为0
              this.data.cData[x * this.data.CN + (y - 1)].score = this.data.cData[x * this.data.CN + prevY].score;
              this.data.cData[x * this.data.CN + prevY].score = 0;
            }
          } else { //若该位置是0 ，将前面非0数的挪到后边，并且从该位置出发再遍历一次
            this.data.cData[x * this.data.CN + y].score = this.data.cData[x * this.data.CN + prevY].score;
            this.data.cData[x * this.data.CN + prevY].score = 0;
            y++;
          }
        }
      } else {
        break;
      }
    }
  },
  rightGetNext: function(x, y) { //右移--获取x行y列前的第一个非0的位置
    for (var prevY = (y - 1); prevY >= 0; prevY--) {
      if (this.data.cData[x * this.data.CN + prevY].score !== 0) {
        return prevY;
      }
    }
    return -1;
  },
  end: function() { //游戏结束验证。0:未结束,1:结束
    for (var x = 0; x < this.data.RN; x++) { //行
      for (var y = 0; y < this.data.CN; y++) { //列
        if (this.data.cData[x * this.data.CN + y].score !== 0) { //当前位置不为空
          if (x < (this.data.RN - 1) && y < (this.data.CN - 1)) { //除在最后一行和最后一列的元素，与右、下元素比
            if (this.data.cData[x * this.data.CN + y].score !== this.data.cData[(x + 1) * this.data.CN + y].score && this.data.cData[x * this.data.CN + y].score !== this.data.cData[x * this.data.CN + (y + 1)].score) {
              continue;
            } else {
              return 0;
            }
          } else if (x === (this.data.RN - 1) && y < (this.data.CN - 1)) { //最后一行和右边比
            if (this.data.cData[x * this.data.CN + y].score !== this.data.cData[x * this.data.CN + (y + 1)].score) {
              continue;
            } else {
              return 0;
            }
          } else if (x < (this.data.RN - 1) && y === (this.data.CN - 1)) { //最后一列和下边比
            if (this.data.cData[x * this.data.CN + y].score !== this.data.cData[(x + 1) * this.data.CN + y].score) {
              continue
            } else { //当前位置为空
              return 0;
            }
          }
        } else {
          return 0;
        }
      }
    }
    return 1;
  },
  endTime: function() {
    // this.sts = this.GAMEOVER;
    //localStorage.setItem('my_2048_score', this.final);
    this.setData({
      end_pop: true
    });
  }
})