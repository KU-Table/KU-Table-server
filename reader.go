package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
)

func main() {
	filePath := "data/subject.json"

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

	fmt.Println("Resulting map of type -> subjectCode slice:")
	for subjectType, codes := range result {
		fmt.Printf("%s: %v\n", subjectType, codes)
	}
}