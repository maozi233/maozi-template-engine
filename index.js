var DomRender = {

  createApp(config) {
    var that = {
      el: config.el,
      data: config.data,
      setData(data) {
        this.data = Object.assign(this.data, data);
        console.log(this.Dep);
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            if (this.Dep[key]) {
              var updates = this.Dep[key];
              for (var i = 0; i < updates.length; i++) {
                var update = updates[i];
                update(this.data);
              }
            }
          }
        }
      },

      // 依赖收集
      Dep: {},
      addDep(valueKeys, update) {
        for (var i = 0; i < valueKeys.length; i++) {
          var key = valueKeys[i];
          
          if (!this.Dep[key]) {
            this.Dep[key] = [];
          }

          this.Dep[key].push(update);
        }
      },
    }

    // 绑定methods
    this.bindMethods(config.methods, that);
    // 渲染dom
    config.el.innerHTML = config.template;
    // 依赖收集
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
    // console.log(childNodes)
    if (!childNodes.length) {
      return
    }

    for(var i = 0, len = childNodes.length; i < len; i += 1) {
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
                node.addEventListener(eventName, context[value])
              }

              // 绑定attr里面的{{}}
              if (this.isInterpolation(value)) {
                var valueKeys = this.getValueKeys(value);
                if (valueKeys.length) {
                  // 闭包把 node, name, value 存下来
                  (function(node, name, value) {
                    function update(data) {
                      node.setAttribute(name, DomRender.bindTemplateData(value, data))
                    }
                    context.addDep(valueKeys, update);
                    update(context.data)
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
          (function(node, template) {
            function update(data) {
              node.textContent = DomRender.bindTemplateData(template, data)
            }
            context.addDep(valueKeys, update);
            update(context.data);
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
    }
    return result;
  }
}

window.DomRender = DomRender;