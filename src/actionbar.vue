<template>
    <div class="search">
        <input type="text" @keydown.enter="search" placeholder="Issue Key or Summary Text" value="" autofocus />
    </div>
</template>

<script>
    import {ipcRenderer} from 'electron';

    export default {
        name: 'app',
        data() {
            return {
            }
        },

        methods: {
            search: () => ipcRenderer.send('app-search')
        },

        mounted() {
            window.addEventListener('keyup', (event) => {
                if (event.keyCode === 27) {
                    ipcRenderer.send('app-hide');
                }
            }, true)
        }
    }
</script>

<style lang="scss" scoped>
    .search {
        width: 97.5%;
        background: white;

        input {
            width: 98%;
            padding: 1em;
            font-size: 1em;
        }
    }
</style>


