# 数据驱动，实现简单的{{}}模板引擎渲染, 使用setData更新依赖

## 1.实现 {{}} 绑定渲染模板
### {{}} 中不支持写表达式 类似 {{ active ? 'active' : '' }}

## 2.实现@eventName 绑定事件

## 3.v-for循环渲染
### for循环用的innerHTML实现，所以里面必须套一层标签 例： <div fy-for="{{infos}}"><p>{{item.xxx}}</p></div>

## 4.setData方法更新渲染

### 本项目要兼容低版本手机，并且对尺寸要求比较高，所以直接用es5来写，免得babel打包之后尺寸变大

```
var app = DomRender.createApp({
  el: document.getElementById('app'),
  template: [
    `
    text: {{text}}
    <div class="{{active}}">name: {{infos.name}}</div>
    <div>测试一行两个 name: {{infos.name}} name: {{infos.name}}</div>
    <div>
      age: {{infos.age}}
      <p>hobby: {{infos.hobby}}</p>
    </div>
    <input type="text" value="{{input}}" @input="handleInput">
    <div>input: {{input}}</div>
    <div fy-for="{{ infos.list }}">
      <p @click="onItemClick" class="{{item.active}}">list[{{$index}}]item: {{item.name}}</p>
    </div>
    <button @click="onClick">click</button>
    `
  ].join(','),
  data: {
    text: 'ttttext',
    infos: {
      hobby: 'bbababa',
      name: 'yyyy',
      age: 111,
      list: [
        { name: 'item-1' },
        { name: 'item-2', active: 'active' },
        { name: 'item-3' },
      ],
    },
    input: '123',
    active: false,
  },
  methods: {
    handleInput(e) {
      // console.log(e.target.value, e.target.nodeType);
      this.setData({
        input: e.target.value,
      })
    },
    onClick(e) {
      this.setData({
        active: 'active',
      })
    },
    onItemClick(e) {
      console.log(e.target);
    }
  }
});
```