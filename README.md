## 共享组件、静态资源、工具类、api及mixins： 

### 组件

在/components 下， 引用方式如

```
import Pagination from 'safe-component/components/Pagination'
```

 可用ElementUI下组件， 在引入后会被wabpack转码。

### 静态资源

在/assets 下， 设想是存放需编译的静态资源， 如.less， 静态图片(会被base64转码）等。
#### .less
位于./less 下， 是预编译文件， .css建议放置在静态路径统一引用。
引用方式：
```
@import '~safe-component/assets/less/common.less';
```
#### 图片
图片位于./img下，引入如下：
```
<img :src="require('safe-component/assets/img/areas.png')"/>
```
### 工具类、api及mixins

这三者需要用rollup + babel打包， 不然在IE下引用会报错。源码放置在/src下， 打包后放置在/lib下。

提供/src/main.js 作为统一入口，打包后为/lib/index.js， 上面三者可以用如下方式统一引用：

```
import { post, loadOrgTreeWithUser } from 'safe-component'
```

打包： 运行npm i， npm run build 可以构建 /lib/index.js ， 或运行 npm run build_all 构建所有js文件

#### 工具类

在/src/utils下面，由/src/utils/index 负责模块输出，打包输出为/lib/utils.js有独立逻辑可以另写文件后在index中输出， 可用npm run build_utils 来独立构建， 应用方式如：

```
import { post } from 'safe-component/lib/utils'
```

也可以在‘safe-component’中统一引用

#### api

提供访问数据接口，如获取组织树，入参为必要参数，返回Promise， 源码在/src/api下， 打包输出为/lib/api.js

可用npm run build_api 来打包， 应用方式如：

```
import { loadOrgTreeWithUser } from 'safe-component/lib/api'
```

```
// in actions
loadOrgTreeWithUser (store, data) {
  return loadOrgTreeWithUser(store.state.orgId)
},
```

#### mixins

提供mixins， 源码在/src/mixins下， 打包输出为/lib/mixins.js

每个mixin 为独立一个文件，放置在/src/mixins下，有。./index统一输出。

可用npm run build_mixins 来打包， 应用方式如：

```
import { setProgress } from 'safe-component/lib/mixins'
```

```
mixins: [ setProgress ],
```

#### wiki文档（包含组件、公共方法说明）
https://km.glodon.com/pages/viewpage.action?pageId=38641382
