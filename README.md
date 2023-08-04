# maozi-template-engine
## 1.实现 {{}} 绑定渲染模板
### {{}} 中不支持写表达式 类似 {{ active ? 'active' : '' }}
## 2.实现@eventName 绑定事件
## 3.v-for循环渲染
### for循环用的innerHTML实现，所有 <div fy-for="{{infos}}"><p>{{item.xxx}}</p></div>里面必须套一层
## 4.setData方法更新渲染

### 本项目要兼容低版本手机，并且对尺寸要求比较高，所以直接用es5来写，免得babel打包之后尺寸变大