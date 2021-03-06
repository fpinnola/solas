import React, { useEffect, useState } from 'react';
import { View, Modal, Text, SectionList, TouchableOpacity, TextInput, Image, StyleSheet, Alert, AsyncStorage } from "react-native";
import FeelingLogger from '../components/feelingLogger';

export default function LogList({ navigation }) {
    const [list, setList] = useState([]);
    const [logs, setLogs] = useState([]);
    const [addLogVisible, setAddLogVisible] = useState(false);
    const [logText, setLogText] = useState("");
    const [feelingLog, setFeelingLog] = useState(null);

    useEffect(() => {
        restoreLogsFromAsync();
      }, []);

    const storeLogs = logs => {
        const stringifiedLogs = JSON.stringify(logs);

        AsyncStorage.setItem('@logs', stringifiedLogs).catch((err) => {
            console.warn('Error storing logs in Async');
            console.warn(err);
        })
    }

    const restoreLogsFromAsync = () => {
        AsyncStorage.getItem('@logs')
        .then(stringifiedLogs => {
            const parsedLogs = JSON.parse(stringifiedLogs);
            if (parsedLogs != null) {
                // setList(parsedLogs);
                setLogs(parsedLogs);
            }
        })
        .catch((err) => {
            console.warn('Error retrieving logs in Async');
            console.warn(err);
        })
    }
    //TODO: truncate number of lines, open up full log by clicking on it

    const getList = () => {
        let tempLogs = logs;
        let tempList = [];
        let tempDict = {};

        for (let i = 0; i < tempLogs.length; i++) {
            let preDate = new Date(tempLogs[i].date);
            let date = preDate.getFullYear() + " " + preDate.getMonth() + " " + preDate.getDay();
            if (tempDict[date] === undefined) {
                tempDict[date] = {
                    title: getSectionTitle(preDate),
                    data: [tempLogs[i]]
                };
            } else {
                let tempData = tempDict[date].data;
                tempData.push(tempLogs[i]);
                tempDict[date].data = tempData;
            }
        }
        for (var prop in tempDict) {
            tempList.push(tempDict[prop]);
        }
        tempList.reverse();
        return tempList;
    }

    function getMonthStr(month) {
        switch (month) {
            case 1: return "Jan";
            case 2: return "Feb";
            case 3: return "Mar";
            case 4: return "Apr";
            case 5: return "May";
            case 6: return "Jun";
            case 7: return "Jul";
            case 8: return "Aug";
            case 9: return "Sep";
            case 10: return "Oct";
            case 11: return "Nov";
            case 12: return "Dec";
            default: return "IDK";
        }
    }

    function getSectionTitle(timestamp) {
        var date = new Date(timestamp);
        var currentDate = new Date();

        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        month = getMonthStr(month);

        var str = month + " " + day;

        if (year != currentDate.getFullYear()) {
            str += " " + date.getFullYear();
        }

        return str;
    }

    function getFormattedDate(timestamp) {
        var date = new Date(timestamp);
    
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
    
        month = getMonthStr(month);
        day = (day < 10 ? "0" : "") + day;
        hour = (hour < 10 ? "0" : "") + hour;
        min = (min < 10 ? "0" : "") + min;
    
        var str = month + " " + day + " " + date.getFullYear() + " " +  hour + ":" + min;
        
        return str;
    }

    function feelingString(value) {
        if (value < 2) {
            return "Very Poorly"
        } else if (value < 4) {
            return "Unwell"
        } else if (value < 6) {
            return "Fair"
        } else if (value < 8) {
            return "Pretty Good"
        } else {
            return "Great!"
        }
    }

    return (
        <View style={styles.container}>
            <Modal 
            animationType="slide"
            transparent={false}
            visible={addLogVisible}
            onRequestClose={()=>{
                Alert.alert("Modal has been closed.");
            }}
            >
                <View style={[styles.container, {justifyContent: "flex-start"}]}>
                    <TouchableOpacity
                    style={{padding: 10, width: "90%", marginTop: 50}}
                    onPress={()=> {
                        setAddLogVisible(false);
                    }}
                    >
                        <Text style={{color: "red", width: "100%", textAlign: "right", fontFamily: "Lato-Bold", fontSize: 14}}>Close</Text>
                    </TouchableOpacity>
                    <FeelingLogger setFeeling={(feeling) => {
                        setFeelingLog(feeling);
                    }}/>
                    <Text style={{marginTop: 25, fontFamily: "Lato-Regular", fontSize: 18, textAlign: "left", width: "90%"}}>Describe how you're feeling</Text>
                    <View style={{width: "90%", height: 150,  backgroundColor: "white", borderRadius: 10, marginTop: 15, justifyContent: "center", alignItems: "center"}}>
                        <TextInput 
                        style={{height: "95%", width: "95%"}}
                        multiline={true}
                        placeholder={"Enter a log"}
                        value={logText}
                        onChangeText={(text) => {
                            setLogText(text)
                        }}
                        />
                    </View>

                    <TouchableOpacity 
                    style={{paddingHorizontal: 25, paddingVertical: 7.5, backgroundColor: "#8F00FF", borderRadius: 7.5,marginTop: 15}}
                    onPress={()=> {
                        var curr = logs;
                        let log = {
                            log: logText,
                            date: Date.now()
                        }
                        if (feelingLog != null) {
                            log.feelingRating = feelingLog;
                        }
                        curr.push(log);
                        setLogText("");
                        setFeelingLog(0.5);
                        storeLogs(curr);
                        setAddLogVisible(false);
                    }}>
                        <Text style={{ color: "#fff", fontFamily: "Lato-Bold", fontSize: 16}}>Add</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <SectionList 
                style={{width: "100%", marginTop: 5}}
                sections={getList()}
                keyExtractor={(item) => item.log}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => {
                    return (
                        <View style={{width: "100%", paddingVertical: 5, justifyContent: "center", alignItems: "center"}}>
                            <View style={{width: "85%"}}>
                                <Text style={{fontFamily: "Lato-Bold", fontSize: 16, color: "#444"}}>{title}</Text>
                            </View>
                        </View>
                    )
                }}
                renderItem={({ item }) => {
                    return (
                        <View style={{width: "100%", paddingVertical: 10, justifyContent: "center", alignItems: "center"}}>
                            <View style={{width: "85%", paddingVertical: 20, paddingHorizontal: 15, backgroundColor: "white", borderRadius: 10, justifyContent: "center", alignItems: "flex-start"}}>
                                {item.feelingRating != null ? <Text style={{fontFamily: "Lato-Bold", fontSize: 17, marginBottom: 5}}>{feelingString(item.feelingRating)}</Text> : null}
                                <Text numberOfLines={-1} style={{fontFamily: "Lato-Regular", fontSize: 16, marginBottom: 5}}>{item.log}</Text>
                                {item.date != null ? <Text style={{color: "#AAA", fontFamily: "Lato-Regular", fontSize: 14}}>{getFormattedDate(item.date)}</Text> : null}
                            </View>
                        </View>
                    )
                }}
            />
            <TouchableOpacity 
            onPress={() => {
                setAddLogVisible(true);
            }}
            style={styles.logButton}>
                <Image style={styles.penImage} source={require('../assets/pen.png')}/>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logButton: {
        height: 64,
        width: 64,
        borderRadius: 75/2,
        backgroundColor: "#8F00FF",
        position: "absolute",
        bottom: 65,
        right: 25,
        justifyContent: "center",
        alignItems: "center"
    },
    penImage: {
        height: 32,
        width: 32,
    }
});