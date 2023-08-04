var DomRender = {

  createApp(config) {
    var that = {
      el: config.el,
      data: config.data,
      setData(data) {
        // console.log(this.Dep);
        for (var key in data) {
          // 更新当前数据
          DomRender.setValueByPath(this.data, key, data[key])
          // 通知这条数据对应的依赖触发更新
          this.notify(key)
        }
      },

      // 依赖收集
      Dep: {},
      // ['infos.name', 'infos.age']
      addDep(valueKeys, update) {
        for (var i = 0; i < valueKeys.length; i++) {
          // infos.name
          var key = valueKeys[i];
          // ['infos', 'name']
          var keyArr = DomRender.getPathArr(key);
          var reduceKey = '';

          // 这里是因为遇到 'infos.name'的时候。要把这个依赖也添加到infos里面去。不然setData({infos: {}}) 无法触发更新
          for (var j = 0; j < keyArr.length; j++) {
            var splitKey = keyArr[j];
            // infos.name
            reduceKey = ([reduceKey, splitKey]).join('.')
            if (j == 0) {
              // infos
              reduceKey = splitKey;
            }

            if (!this.Dep[reduceKey]) {
              this.Dep[reduceKey] = [];
            }

            var updates = this.Dep[reduceKey];
            if (updates.indexOf(update) == -1) {
              this.Dep[reduceKey].push(update);
            }
          }
        }
      },
      // 更新依赖
      notify(key) {
        if (this.Dep[key]) {
          var updates = this.Dep[key];
          for (var i = 0; i < updates.length; i++) {
            var update = updates[i];
            update(this.data);
          }
        }
      }
    }

    // 绑定methods
    this.bindMethods(config.methods, that);
    // 渲染dom
    config.el.innerHTML = config.template;
    // 模板渲染
    this.compile(that.el, that);

    return that;
  },

  bindMethods(methods, context) {
    for (var key in methods) {
      if (methods.hasOwnProperty(key)) {
        context[key] = methods[key].bind(context);
      }
    }
  },

  compile(el, context) {
    var childNodes = el.childNodes;
    if (!childNodes.length) {
      return
    }

    for (var i = 0, len = childNodes.length; i < len; i += 1) {
      var node = childNodes[i];

      if (this.isElement(node)) {
        var attributes = node.attributes;

        if (attributes.length) {
          for (var key in attributes) {
            if (attributes.hasOwnProperty(key)) {
              var name = attributes[key].name;
              var value = attributes[key].value;

              // 绑定事件
              if (name.indexOf('@') === 0) {
                var eventName = name.slice(1);
                if (!context[value]) {
                  throw new Error('Uncaught TypeError: Cannot read properties of undefined (reading '+ value +')')
                }
                node.addEventListener(eventName, context[value])
              }

              // for循环 fy-for="{{list}}"
              else if (name.indexOf('fy-for') === 0) {
                console.log(`${name}=${value}`)
                // ['list']
                var valueKeys = this.getValueKeys(value);
                if (valueKeys.length) {
                  (function(node) {
                    var temp = node.innerHTML;
                    function loopUpdate(data) {
                      var list = DomRender.getValueByPath(data, valueKeys[0]) || [];
                      var innerHTML = '';
                      for (var j = 0; j < list.length; j++) {
                        innerHTML += DomRender.bindTemplateData(temp, { item: list[j], $index: j })
                      }
                      node.innerHTML = innerHTML;
                      // 给重新渲染的dom绑定事件
                      console.log(node)
                      DomRender.compile(node, context);
                    }
                    context.addDep(valueKeys, loopUpdate);
                    loopUpdate(context.data);
                  })(node)
                }
              }

              // 绑定attr里面的{{}}
              else if (this.isInterpolation(value)) {
                var valueKeys = this.getValueKeys(value);
                if (valueKeys.length) {
                  // 闭包把 node, name, value 存下来
                  (function (node, name, value) {
                    function attrUpdate(data) {
                      node.setAttribute(name, DomRender.bindTemplateData(value, data))
                    }
                    context.addDep(valueKeys, attrUpdate);
                    attrUpdate(context.data)
                  })(node, name, value)
                }
              }
            }
          }
        }
      }
      // 文字内容 <div>text: {{text}} <div>123</div></div> 中的 text: {{text}} 
      else if (node.nodeType === 3 && this.isInterpolation(node.textContent)) {
        var template = node.textContent;
        var valueKeys = this.getValueKeys(template);
        if (valueKeys.length) {
          // 闭包保存 template 和node
          (function (node, template) {
            function textUpdate(data) {
              node.textContent = DomRender.bindTemplateData(template, data)
            }
            context.addDep(valueKeys, textUpdate);
            textUpdate(context.data);
          })(node, template)
        }
      }

      // 递归
      if (node.childNodes && node.childNodes.length) {
        this.compile(node, context);
      }
    }
  },

  isElement(node) {
    return node.nodeType === 1;
  },

  // 判断字符串里面有没有 {{}}
  isInterpolation(str) {
    return /\{\{(.*)\}\}/.test(str)
  },

  /**
   * 获取字符串模板中 {{}} 中的值
   * @param {str} template 
   * @example '<p>{{ dataB }}, {{ dataC }}</p>' -> ["dataB", "dataC"]
   */
  getValueKeys(template) {
    var regex = /{{\s*(.*?)\s*}}/g;
    var results = [];
    var match;
    while ((match = regex.exec(template)) !== null) {
      results.push(match[1]);
    }
    return results;
  },

  /**
   * @param {string} str 
   * @param {object} data 
   * @example (text: {{text}}, {text: 123}) -> 'text: 123' 
   */
  bindTemplateData(str, data) {
    // 替换变量
    return str.replace(/{{([^}]+)}}/g, (_, key) => {
      return String(DomRender.getValueByPath(data, key.trim()));
    })
  },

  /**
   * 因为不能通过 'infos.name' 去访问 data['infos.name'] 只能一层层获取
   * @param {object} data 
   * @param {string} key 
   * @returns ({infos: {name: 'yaowei'}}, 'infos.name') -> 'yaowei'
   */
  getValueByPath(data, key) {
    var keys = key.split('.');
    var result = data;
    for (var i = 0; i < keys.length; i++) {
      var prop = keys[i];
      result = result[prop];
      // if (result == undefined || result == null) {
      //   throw new Error('Uncaught TypeError: Cannot read properties of undefined (reading '+ prop +')')
      // }
    }
    return result;
  },

  /**
   * 把key根据 []或者.来切割
   * @param {string} path 
   * @example 'infos.name' -> ['infos', 'name']
   */
  getPathArr(path) {
    return path.split(/[\[\]\.]/)
  },

  // 因为不能通过 'infos.name' 去设置 data['infos.name'] 只能一层层获取
  setValueByPath (obj, path, value) {
    var pathArr = this.getPathArr(path)
    var result = obj
    var i = 0
    var len = pathArr.length
    for (; i < len - 1; i += 1 ) {
      result = result[pathArr[i]]
    }
    result[pathArr[i]] = value
  },
}

window.DomRender = DomRender;