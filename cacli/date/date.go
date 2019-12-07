package date

import (
	"math"
	"strconv"
	"strings"
	"time"
)

func TimeElapsed(now time.Time, then time.Time, full bool) string {
	var parts []string
	var text string

	year2, month2, day2 := now.Date()
	year1, month1, day1 := then.Date()

	year := math.Abs(float64(int(year2 - year1)))
	month := math.Abs(float64(int(month2 - month1)))
	day := math.Abs(float64(int(day2 - day1)))

	diff := now.Sub(then)
	hour := float64(int(diff.Hours()))
	minute := float64(int(diff.Minutes()))

	if year > 0 {
		if int(year) == 1 {
			parts = append(parts, "a year")
		} else {
			parts = append(parts, strconv.Itoa(int(day))+" years")
		}
	}

	if month > 0 {
		if int(month) == 1 {
			parts = append(parts, "a month")
		} else {
			parts = append(parts, strconv.Itoa(int(day))+" months")
		}
	}

	if day > 0 {
		if int(day) == 1 {
			parts = append(parts, "a day")
		} else {
			parts = append(parts, strconv.Itoa(int(day))+" days")
		}
	}

	if hour > 0 {
		if int(hour) == 1 {
			parts = append(parts, "an hour")
		} else {
			parts = append(parts, strconv.Itoa(int(hour))+" hours")
		}
	}

	if minute > 0 {
		if int(minute) == 1 {
			parts = append(parts, "a minute")
		} else {
			parts = append(parts, strconv.Itoa(int(minute))+" minutes")
		}
	}

	if now.After(then) {
		text = " ago"
	} else {
		text = " after"
	}

	if len(parts) == 0 {
		return "just now"
	}

	if full {
		return strings.Join(parts, ", ") + text
	}
	return parts[0] + text
}
