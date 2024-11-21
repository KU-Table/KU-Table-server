package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"regexp"
	"strings"
	"path/filepath"
)

func main() {

	// inputFile := "data/2024_Nov/Aesthetics.txt"
	// outputFile := "output/2024_Nov/Aesthetics.json"
	
	// inputFile := "data/test.txt"
	// outputFile := "output/output.json"

	// convertTextToJSON(inputFile, outputFile)
	
	folderPath := "./output/2024_Nov" // Change to your folder path
	outputFile := "./output/2024_Nov.json"

	// Combine the JSON files from the folder
	combineJSONFromFolder(folderPath, outputFile)
}

type Course struct {
	Type    string `json:"type"`
	NameEN  string `json:"nameEN"`
	NameTH  string `json:"nameTH"`
	Unit    string `json:"unit"`
	Hour    string `json:"hour"`
	Faculty string `json:"faculty"`
	Message string `json:"Message"`
}

func convertTextToJSON(inputFile string, outputFile string) {
	content, err := ioutil.ReadFile(inputFile)
	if err != nil {
		log.Fatalf("Failed to read file: %v", err)
	}

	lines := strings.Split(string(content), "\n")

	courses := make(map[string]Course)

	courseType := strings.TrimSpace(lines[0])
	fmt.Println("CourseType is ", courseType)

	for _, line := range lines[1:] {
		if strings.TrimSpace(line) == "" {
			fmt.Println("strings.TrimSpace(line): ", strings.TrimSpace(line))
			continue
		}

		parts := strings.Split(line, "\t")
		if len(parts) != 4 {
			fmt.Println("parts: ", parts, len(parts))
			continue
		}

		code := strings.TrimSpace(parts[0])
		name := strings.TrimSpace(parts[1])
		unitAndHour := strings.TrimSpace(parts[2])
		faculty := strings.TrimSpace(parts[3])

		re := regexp.MustCompile(`(\d+)\(([\d-]+)\)`)
		matches := re.FindStringSubmatch(unitAndHour)

		var unit, hour string
		if len(matches) > 0 {
			if matches[1] == "" || matches[2] == "" {
				panic("error matches")
			}
			unit = matches[1]
			hour = matches[2]
		} else {
			panic("error matches len")
		}

		course := Course{
			Type:    courseType,
			NameEN:  name,
			NameTH:  name,
			Unit:    unit,
			Hour:    hour,
			Faculty: faculty,
			Message: "manual read by code",
		}

		courses[code] = course
	}
	
	if len(courses) == 0 {
		panic("course not found")
	}
	fmt.Println("course founded: ", len(courses))

	jsonData, err := json.MarshalIndent(courses, "", "  ")
	if err != nil {
		log.Fatalf("Failed to convert to JSON: %v", err)
	}

	err = ioutil.WriteFile(outputFile, jsonData, 0644)
	if err != nil {
		log.Fatalf("Failed to write to file: %v", err)
	}

	fmt.Println("JSON file has been created successfully!")
}

// Function to read and combine JSON from all files in a folder into a single flat JSON object
func combineJSONFromFolder(folderPath, outputFile string) {
	combinedData := make(map[string]interface{})

	// Read all files in the specified folder
	files, err := ioutil.ReadDir(folderPath)
	if err != nil {
		log.Fatalf("Failed to read folder: %v", err)
	}

	// Process each file in the folder
	for _, file := range files {
		// Only process JSON files
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
			filePath := filepath.Join(folderPath, file.Name())

			content, err := ioutil.ReadFile(filePath)
			if err != nil {
				log.Printf("Failed to read file %s: %v", filePath, err)
				continue
			}

			var data map[string]interface{}
			err = json.Unmarshal(content, &data)
			if err != nil {
				log.Printf("Failed to unmarshal JSON from %s: %v", filePath, err)
				continue
			}

			// Merge the data into the combinedData map
			for key, value := range data {
				combinedData[key] = value
			}
		}
	}

	// Convert combined data to JSON
	combinedJSON, err := json.MarshalIndent(combinedData, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal combined data: %v", err)
	}

	// Write the combined JSON to the output file
	err = ioutil.WriteFile(outputFile, combinedJSON, 0644)
	if err != nil {
		log.Fatalf("Failed to write to file %s: %v", outputFile, err)
	}

	fmt.Println("JSON files combined successfully!")
}