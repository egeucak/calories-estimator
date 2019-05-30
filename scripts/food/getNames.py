from bs4 import BeautifulSoup as bs
import requests
import csv

url = 'https://www.allrecipes.com/recipes/17562/dinner/?page='
foodNames=set()
for i in range(1, 50):
	url += str(i)
	page_response = requests.get(url, timeout=10)

	page_content = bs(page_response.content, "html.parser")

#print(page_content)

	for article in page_content.find_all('article', class_='fixed-recipe-card'):
		text = article.findNext('div').findNext('div').h3.a.span
		foodNames.add(text.text)

print(f'Total {len(foodNames)} andn{foodNames}')

with open('dinnerNames.csv', mode='w') as employee_file:
    employee_writer = csv.writer(employee_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for i, name in enumerate(foodNames):
    	employee_writer.writerow([i, name])