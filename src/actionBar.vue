<template>
    <v-app>
        <v-container class="container" fluid>
            <v-layout class="search" row>
                <v-flex xs12>
                    <v-text-field
                            v-model="searchCriteria"
                            @keydown.native.enter="search()"
                            label="Issue Key, Summary Text, or JQL"
                            single-line
                            prepend-icon="search"
                            :autofocus="true"
                    ></v-text-field>
                </v-flex>
            </v-layout>

            <v-layout v-if="searchResults.length > 0">
                <v-flex class="result-list" xs12>
                    <ul>
                        <li v-for="result in searchResults">
                            {{ result }}
                        </li>
                    </ul>
                </v-flex>
            </v-layout>
        </v-container>
    </v-app>
</template>

<script>
    import {ipcRenderer} from 'electron';

    export default {
        name: 'app',
        data() {
            return {
                searchCriteria: '',

                searchResults: [],
            }
        },

        methods: {
            search: function () {
                console.log('Begin search.');

                // todo this is for testing search results
                this.searchResults.push(this.searchCriteria);

                ipcRenderer.send('bar-search');
            }
        },

        mounted() {
            window.addEventListener('keyup', (event) => {
                if (event.keyCode === 27) {
                    if (this.searchCriteria) {
                        if (this.searchResults.length > 0) {
                            this.searchResults = [];
                        }

                        this.searchCriteria = '';

                        ipcRenderer.send('bar-reset');
                    } else {
                        ipcRenderer.send('bar-hide');
                    }
                }
            }, true);
        }
    }
</script>

<style lang="scss" scoped>
    .application.theme--light {
        background: white !important;
    }

    .container {
        padding: 0;
    }

    .search {
        width: 97.5%;
        height: 74px;
        background: white;
        padding: .2em .2em .2em 1em;

        input {
            width: 98%;
            padding: .5em;
            font-size: 1.5em;
        }
    }

    .result-list {
        border-top: 1px solid #a1a1a1;
        padding: .5em;
    }
</style>


