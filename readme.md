# 微应用

-  `主应用`  负责容纳 `子应用` 
-  `子应用`  负责各自的业务


# 应用说明

应用名 | 端口 | 作用
---|---|---
root-config|9000|主应用
main|9001|主体内容
navbar|9002|导航头
data|9003|数据通信


#  `主应用` 

```
npx create-single-spa
```

选择 `single-spa root config` 创建一个名称为 `root-config` 的 `主应用` 

```
cd root-config
npm start
```

来看下项目结构，
```
|- src/
|-   index.ejs
|-   test-root-config.js
```

- `index.ejs`
```ejs
<script type="systemjs-importmap">
  {
    "imports": {
      "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js"
    }
  }
</script>
```
加载应用代码配置

```html
<script>
  System.import('@test/root-config');
</script>
```
加载 `主应用` ，是基座应用

```ejs
<script type="systemjs-importmap">
  {
    "imports": {
      "@test/root-config": "//localhost:9000/test-root-config.js"
    }
  }
</script>
```
本地访问 `主应用` 配置


- `test-root-config.js`

加载远程 `子应用` 
```js
registerApplication({
  name: "@single-spa/welcome",
  app: () =>
    System.import(
      "https://unpkg.com/single-spa-welcome/dist/single-spa-welcome.js"
    ),
  activeWhen: ["/"],
});
```


当路由发生变化时，hashChange或popState会触发，这时single-spa会监听到，并触发urlReroute；接着它会调用reroute，该函数正确设置各个应用的状态后，直接通过调用应用所暴露出的生命周期钩子函数即可。当某个应用被推送到appsToMount后，它的mount函数会被调用，该应用就会被挂载；而推送到appsToUnmount中的应用则会调用其unmount钩子进行卸载。

single-spa除了监听hashChange或popState两个事件外，还劫持了原生的pushState和 replaceState两个方法。因为像scroll-restorer这样的第三方组件可能会在页面滚动时，通过调用pushState或replaceState，将滚动位置记录在state中，而页面的url实际上没有变化。这种情况下，single-spa理论上不应该去重新加载应用，但是由于这种行为会触发页面的hashChange事件，所以根据上面的逻辑，single-spa会发生意外重载。为了解决这个问题，single-spa允许开发者手动设置是否只对url值的变化监听，而不是只要发生hashChange或popState就去重新加载应用
```js
start({
  urlRerouteOnly: true,
});
```
这样除非url发生了变化，否则pushState和popState不会导致应用重载


# 子应用 


```
npx create-single-spa
```

选择 `single-spa application / parcel` 创建一个名称为 `hello` 的 `子应用` 

每个应用默认启动端口为 `9000`，因为 `主应用` 是 `9000` 启动的，所以，修改启动端口为 `9001`
```
"start": "webpack serve -- --port 9001"
```

此时，启动 `子应用` 是无法直接看到界面的，需要注册到 `主应用` 里，通过 `主应用` 来访问，需要在 `主应用` 里做配置修改
```js
registerApplication({
  name: "@test/hello",
  app: () => System.import("@test/hello"),
  activeWhen: ["/hello"],
});
```

访问 `http://localhost:9000/hello`，看不到 `子应用` 界面。此时，本地启动的 `子应用` 需要告诉 `主应用` 在哪里
```ejs
<% if (isLocal) { %>
<script type="systemjs-importmap">
  {
    "imports": {
      "@test/root-config": "//localhost:9000/test-root-config.js",
      "@test/hello": "//localhost:9001/test-main.js" // 告诉 `主应用` ，需要加载的 `子应用` 在哪里
    }
  }
</script>
<% } %>
```

原本只想访问 `http://localhost:9000/hello` 页面，但是， `主应用` 的内容却也展示出来了，需要对 `主应用` 的激活路由进行过滤配置
```js
registerApplication(
  "@single-spa/welcome",
  () =>
    System.import(
      "https://unpkg.com/single-spa-welcome/dist/single-spa-welcome.js"
    ),
  (location) => {
    return location.pathname === "/"; // 严格匹配路由
  }
);
```
>参数由原来的对象形式变成逐一传入的形式

再次访问 `http://localhost:9000/hello`，将只能看到 `@test/hello` 应用的内容


# 子应用加载到某个dom节点内

选择 `single-spa application / parcel` 创建一个名称为 `navbar` 的 `子应用` 

将 `navbar` 嵌入到 `#nav` 元素内，首先，需要在 `子应用` 里指定应用存放的容器

```js
const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
  domElementGetter: () => document.getElementById("nav"), // 指定容器
});
```

修改端口为 `9002`，启动子应用


指定应用映射
```ejs
<% if (isLocal) { %>
<script type="systemjs-importmap">
  {
    "imports": {
      "@test/root-config": "//localhost:9000/test-root-config.js",
      "@test/hello": "//localhost:9001/test-main.js",
      "@test/navbar": "//localhost:9002/test-navbar.js"
    }
  }
</script>
<% } %>
```


在 `主应用` 里注册该 `子应用`
```js
registerApplication(
  "@test/navbar",
  () => System.import("@test/navbar"),
  location => true, // 必须为function类型
);
```

>因为 `location => true`，为true，所以，不管是哪个路由都会显示 `@test/navbar` 应用

# scss

项目里使用 `scss` 编译样式

现在，对 `@test/navbar` 子应用添加 `scss` 支持

先安装依赖
```
npm i style-loader css-loader sass fast-sass-loader
```

`navbar/webpack.config.js` 添加 `webpack` 配置
```
module: {
  rules: [
    {
      test: /\.(sa|s?c)ss$/,
      use: ["style-loader", "css-loader", "fast-sass-loader"],
    },
  ],
},
```

然后，可以畅快地写scss啦，导入 `index.scss` 试试看

- 语义化

同样，可以使用 `import styles from index.module.scscs`，但 `css-loader` 默认的是 `[hash:base64]` 哈希算法，不具有语义化

在 `webpack` 添加 `localIdentName` 配置即可。
```
{
  test: /\.css$/i,
  loader: "css-loader",
  options: {
    modules: {
      localIdentName: "[path][name]__[local]--[hash:base64:5]",
    },
  },
},
```

- 复杂项目样式解决方案

如果项目嵌套比较复杂，可以尝试一下的方案，
```js
{
  // modify the webpack config however you'd like to by adding to this object
  module: {
    rules: [
      // SCSS ALL EXCEPT MODULES
      {
        test: /\.s?css$/,
        exclude: /\.module\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                mode: "icss",
              },
            },
          },
          "fast-sass-loader",
        ],
      },
      // --------
      // SCSS MODULES
      {
        test: /\.module\.scss$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                mode: "local",
                localIdentName: `${projectName}-[path][name]__[local]--[hash:base64:5]`,
                localIdentContext: path.resolve(__dirname, "src"),
              },
            },
          },
          "fast-sass-loader",
        ],
      },
      // --------
    ],
  },
}
```
>如果node语法报错，尝试在eslint配置文件指定环境，`"env": {"node": true},`

- 抽离样式文件

首先，替换 `style-loader`
```js
isProd(argv) ? MiniCssExtractPlugin.loader : "style-loader"
```

其次，添加 `plugins`
```js
{
  plugins: [].concat(isProd(argv) ? [new MiniCssExtractPlugin()] : []),
}
```

>[更多样式配置](https://www.npmjs.com/package/css-loader)

# 部署

打包前，配置好map
```ejs
<script type="systemjs-importmap">
  {
    "imports": {
      "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@5.9.0/lib/system/single-spa.min.js",
      "react": "https://cdn.jsdelivr.net/npm/react@16.13.1/umd/react.production.min.js",
      "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@16.13.1/umd/react-dom.production.min.js",
      "@test/root-config": "//domain.com/test-root-config.js",
      "@test/navbar": "//domain.com/test-navbar.js",
      "@test/main": "//domain.com/test-main.js"
    }
  }
</script>
```

或者，将map放在一个json文件里，通过script引入
```
<script type="systemjs-importmap" src="map.json"></script>
```

>为了节省配置，将打包后的 `html` 和 `js` 文件放在同一个目录下

```
server {
    listen      端口;
    server_name ip;

    location / {
        root    html/micro;
        index   index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

# 应用通讯

- 方法，组件，逻辑，全局状态
- [API数据](https://zh-hans.single-spa.js.org/docs/recommended-setup#api%E6%95%B0%E6%8D%AE)
- [ui状态](https://zh-hans.single-spa.js.org/docs/recommended-setup#ui%E7%8A%B6%E6%80%81)


## 方法，组件，逻辑，全局状态

可以在不同git仓库或JS包的微前端之间导入或导出方法，组件，逻辑，全局状态


- 导出

微应用需要向外部暴露方法、组件、逻辑、状态等
```js
// 对外暴露的获取本应用数据的方法
export function hasAccess(permission) {
  const permissions = ["admin", "guest"];
  return permissions.some((p) => p === permission);
}
```

- 导入

从微应用导入需要使用的方法、组件、逻辑、状态等

案例，在 `@test/navbar` 获取 `@test/data` 存储的数据
```js
import { hasAccess } from "@test/data";

hasAccess("admin");
```


**注意，以下值不会显示出来**
- 布尔值
- undefined
- `new Array(1)`
- `function () {}`
- `Symbol.for("1")`


**以下显示错误**
- `NaN` 显示为 `null`

**报错**
- `new Object(1)`
- `new RegExp("/d+/", "g")`
- `new Date()`


>参考[这里](https://zh-hans.single-spa.js.org/docs/recommended-setup#%E5%BA%94%E7%94%A8%E5%86%85%E9%80%9A%E4%BF%A1)

