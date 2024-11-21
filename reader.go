package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
)

func main() {
	org := readSubjectJsonStat("data/subject.json")
	nov2024 := readSubjectJsonStat("converter/output/2024_Nov.json")

	//fmt.Println(org, nov2024)
	//compareMaps(org, nov2024)

	for key := range nov2024["Wellness"] {
		if _, exists := org["Wellness"]; !exists {
			fmt.Printf("Key %s is missing in map1\n", key)
		}
	}

	allOrg := append(append(org["Wellness"], org["Entrepreneurship"]...), append(org["Thai_Citizen_and_Global_Citizen"], org["Language_and_Communication"]...)...)
	allOrg = append(allOrg, org["Aesthetics"]...)

	fmt.Println(subtractArrays(nov2024["Wellness"], org["Wellness"]))
	fmt.Println(subtractArrays(nov2024["Wellness"], allOrg))
	fmt.Println(subtractArrays(nov2024["Entrepreneurship"], allOrg))
	fmt.Println(subtractArrays(nov2024["Thai_Citizen_and_Global_Citizen"], allOrg))
	fmt.Println(subtractArrays(nov2024["Language_and_Communication"], allOrg))
	fmt.Println(subtractArrays(nov2024["Aesthetics"], allOrg))
	fmt.Println(subtractArrays(org["Wellness"], nov2024["Wellness"]))
}

func readSubjectJsonStat(filePath string) map[string][]string {
	fmt.Println("filename: ", filePath)
	data, err := ioutil.ReadFile(filePath)
	if err != nil {
		log.Fatal("Error reading file:", err)
	}

	var rawData map[string]map[string]string
	if err := json.Unmarshal(data, &rawData); err != nil {
		log.Fatal("Error unmarshalling JSON:", err)
	}

	result := make(map[string][]string)

	for subjectCode, data := range rawData {
		subjectType, ok := data["type"]
		if !ok {
			continue
		}
		result[subjectType] = append(result[subjectType], subjectCode)
	}

	// fmt.Println("Resulting map of type -> subjectCode slice:")
	// for subjectType, codes := range result {
	// 	fmt.Printf("%s: %v\n", subjectType, codes)
	// }

	return result
}

func subtractArrays(arr1, arr2 []string) []string {
	// Create a map to track elements in arr2
	elements := make(map[string]struct{})
	for _, val := range arr2 {
		elements[val] = struct{}{}
	}

	// Collect elements from arr1 that are not in arr2
	var result []string
	for _, val := range arr1 {
		if _, found := elements[val]; !found {
			result = append(result, val)
		}
	}

	return result
}
