<template>
  <div>
    <Designer v-on:designerInitialized="designerInitialized"></Designer>
  </div>
</template>

<script>
import Designer from '../../components/Designer'
import {ref} from "vue"
import axios from "axios"
import GC from '@grapecity/spread-sheets'
import ExcelIO from '@grapecity/spread-excelio'

export default {
  name: 'App',
  components: {
    Designer
  },
  setup(){
    axios.defaults.baseURL="http://localhost:8088";
    let designer = undefined;
    let templateJSON = undefined;
    
    let designerInitialized=(wb)=>{
      designer = wb;
      let spread = designer.getWorkbook();
    }

    let load = (e)=>{
        let spread = designer.getWorkbook();
        let formData = new FormData();
        formData.append("fileName", "path");
        axios.post('spread/loadTemplate', formData, {
            responseType: "json",
        }).then((response) => {
            if(response) {
                alert("加载成功");
                templateJSON = response.data;
                spread.fromJSON(templateJSON);
            }
        }).catch((response) => {
            alert("错误");
        })
    }

    let update = (e)=>{
        let spread = designer.getWorkbook();
        let spreadJSON = JSON.stringify(spread.toJSON());
        let formData = new FormData();
        formData.append("jsonString", spreadJSON);
        formData.append("fileName", "fileName");
        axios.post('spread/updateTemplate', formData).then((response) => {
            if(response) {
                alert("更新成功");
            }
        }).catch((response) => {
            alert("错误");
        })
    }

    //自定义工具栏
    let DefaultConfig = GC.Spread.Sheets.Designer.DefaultConfig;
    let customerRibbon = {
      id: "operate",
      text: "操作",
      buttonGroups: [
        {
          label: "文件操作",
          thumbnailClass: "ribbon-thumbnail-spreadsettings",
          commandGroup: {
            children: [
              {
                direction: "vertical",
                commands: ["loadTemplateCommand", "updateTemplateCommand"],
              }
            ],
          },
        },
      ],
    };

    let ribbonFileCommands = {
        "loadTemplateCommand": {
            iconClass: "ribbon-button-download",
            text: "加载",
            //bigButton: true,
            commandName: "loadTemplate",
            execute: load
        },
        "updateTemplateCommand": {
            iconClass: "ribbon-button-upload",
            text: "更新",
            //bigButton: true,
            commandName: "updateTemplate",
            execute: update
        }
    }

    DefaultConfig.ribbon.push(customerRibbon);
    DefaultConfig.commandMap = {};
    Object.assign(DefaultConfig.commandMap, ribbonFileCommands); 

    return {
      designerInitialized,
      load,
      update
    }
  }
}
</script>

<style>
    .ribbon-button-download {
        background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTEyLjI5MyA1MTIuMjkzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIuMjkzIDUxMi4yOTM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIHN0eWxlPSJmaWxsOiNCQkRFRkI7IiBkPSJNNDAyLjE0OCwxNDkuNjA2QzM4NC4zMzgsNjMuMDU0LDI5OS43MzUsNy4zMjgsMjEzLjE4MywyNS4xMzgNCglDMTM5LjA3LDQwLjM4OSw4NS43NzQsMTA1LjQ3Miw4NS40MzQsMTgxLjEzNmMwLDMuNjA1LDAuMTQ5LDcuMjk2LDAuNDY5LDExLjJDMzMuMTc4LDE5Ny45MTctNS4wNCwyNDUuMTgzLDAuNTQxLDI5Ny45MDgNCgljNS4xNzMsNDguODcsNDYuNDE2LDg1Ljk0Myw5NS41NTksODUuODk1aDExLjJjLTAuMjU2LTMuNTQxLTAuNTMzLTcuMDYxLTAuNTMzLTEwLjY2N2MwLTc2LjU4Myw2Mi4wODMtMTM4LjY2NywxMzguNjY3LTEzOC42NjcNCglTMzg0LjEsMjk2LjU1MywzODQuMSwzNzMuMTM2YzAsMy42MDUtMC4yNzcsNy4xMjUtMC41MzMsMTAuNjY3aDExLjJjNjQuNzMsMC4xNzcsMTE3LjM0OC01Mi4xNTQsMTE3LjUyNS0xMTYuODg1DQoJQzUxMi40NjIsMjA0LjgwNyw0NjQuMTQ4LDE1My4zNDgsNDAyLjE0OCwxNDkuNjA2TDQwMi4xNDgsMTQ5LjYwNnoiLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6IzRDQUY1MDsiIGN4PSIyNDUuNDM0IiBjeT0iMzczLjEzNiIgcj0iMTE3LjMzMyIvPg0KPGc+DQoJPHBhdGggc3R5bGU9ImZpbGw6I0ZBRkFGQTsiIGQ9Ik0yNDUuNDM0LDQ0Ny44MDNjLTUuODkxLDAtMTAuNjY3LTQuNzc2LTEwLjY2Ny0xMC42Njd2LTEyOGMwLTUuODkxLDQuNzc2LTEwLjY2NywxMC42NjctMTAuNjY3DQoJCXMxMC42NjcsNC43NzYsMTAuNjY3LDEwLjY2N3YxMjhDMjU2LjEsNDQzLjAyNywyNTEuMzI1LDQ0Ny44MDMsMjQ1LjQzNCw0NDcuODAzeiIvPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiNGQUZBRkE7IiBkPSJNMjQ1LjQzNCw0NDcuODAzYy0yLjgzMSwwLjAwNS01LjU0OC0xLjExNS03LjU1Mi0zLjExNWwtNDIuNjY3LTQyLjY2Nw0KCQljLTQuMDkzLTQuMjM3LTMuOTc1LTEwLjk5LDAuMjYyLTE1LjA4M2M0LjEzNC0zLjk5MywxMC42ODctMy45OTMsMTQuODIxLDBsMzUuMTM2LDM1LjExNWwzNS4xMTUtMzUuMTE1DQoJCWM0LjIzNy00LjA5MywxMC45OS0zLjk3NSwxNS4wODMsMC4yNjJjMy45OTMsNC4xMzQsMy45OTMsMTAuNjg3LDAsMTQuODIxbC00Mi42NjcsNDIuNjY3DQoJCUMyNTAuOTY1LDQ0Ni42ODIsMjQ4LjI1Nyw0NDcuODAyLDI0NS40MzQsNDQ3LjgwM3oiLz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K");
    }
    .ribbon-button-upload {
        background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNTEyLjI5MyA1MTIuMjkzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIuMjkzIDUxMi4yOTM7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIHN0eWxlPSJmaWxsOiNCQkRFRkI7IiBkPSJNNDAyLjE0OCwxNDkuNjA2QzM4NC4zMzgsNjMuMDU0LDI5OS43MzUsNy4zMjgsMjEzLjE4MywyNS4xMzgNCglDMTM5LjA3LDQwLjM4OSw4NS43NzQsMTA1LjQ3Miw4NS40MzQsMTgxLjEzNmMwLDMuNjA1LDAuMTQ5LDcuMjk2LDAuNDY5LDExLjJDMzMuMTc4LDE5Ny45MTctNS4wNCwyNDUuMTgzLDAuNTQxLDI5Ny45MDgNCgljNS4xNzMsNDguODcsNDYuNDE2LDg1Ljk0Myw5NS41NTksODUuODk1aDExLjJjLTAuMjU2LTMuNTQxLTAuNTMzLTcuMDYxLTAuNTMzLTEwLjY2N2MwLTc2LjU4Myw2Mi4wODMtMTM4LjY2NywxMzguNjY3LTEzOC42NjcNCglTMzg0LjEsMjk2LjU1MywzODQuMSwzNzMuMTM2YzAsMy42MDUtMC4yNzcsNy4xMjUtMC41MzMsMTAuNjY3aDExLjJjNjQuNzMsMC4xNzcsMTE3LjM0OC01Mi4xNTQsMTE3LjUyNS0xMTYuODg1DQoJQzUxMi40NjIsMjA0LjgwNyw0NjQuMTQ4LDE1My4zNDgsNDAyLjE0OCwxNDkuNjA2TDQwMi4xNDgsMTQ5LjYwNnoiLz4NCjxjaXJjbGUgc3R5bGU9ImZpbGw6IzRDQUY1MDsiIGN4PSIyNDUuNDM0IiBjeT0iMzczLjEzNiIgcj0iMTE3LjMzMyIvPg0KPGc+DQoJPHBhdGggc3R5bGU9ImZpbGw6I0ZBRkFGQTsiIGQ9Ik0yNDUuNDM0LDQ0Ny44MDNjLTUuODkxLDAtMTAuNjY3LTQuNzc2LTEwLjY2Ny0xMC42Njd2LTEyOGMwLTUuODkxLDQuNzc2LTEwLjY2NywxMC42NjctMTAuNjY3DQoJCXMxMC42NjcsNC43NzYsMTAuNjY3LDEwLjY2N3YxMjhDMjU2LjEsNDQzLjAyNywyNTEuMzI1LDQ0Ny44MDMsMjQ1LjQzNCw0NDcuODAzeiIvPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiNGQUZBRkE7IiBkPSJNMjg4LjEsMzYyLjQ3Yy0yLjgzMSwwLjAwNS01LjU0OC0xLjExNS03LjU1Mi0zLjExNWwtMzUuMTE1LTM1LjEzNmwtMzUuMTE1LDM1LjEzNg0KCQljLTQuMjM3LDQuMDkzLTEwLjk5LDMuOTc1LTE1LjA4My0wLjI2MmMtMy45OTMtNC4xMzQtMy45OTMtMTAuNjg3LDAtMTQuODIxbDQyLjY2Ny00Mi42NjdjNC4xNjUtNC4xNjQsMTAuOTE3LTQuMTY0LDE1LjA4MywwDQoJCWw0Mi42NjcsNDIuNjY3YzQuMTU5LDQuMTcyLDQuMTQ5LDEwLjkyNi0wLjAyNCwxNS4wODVDMjkzLjYzLDM2MS4zNSwyOTAuOTIzLDM2Mi40NjksMjg4LjEsMzYyLjQ3eiIvPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPC9zdmc+DQo=");
    }
</style>