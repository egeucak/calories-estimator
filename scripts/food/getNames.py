from bs4 import BeautifulSoup as bs
import requests
import csv
import argparse

parser = argparse.ArgumentParser(description='Web scraping for food names.')
parser.add_argument('url', type=str, help='Base url for food category. Should end with page=#ITERATIVE NUMBER')
args = parser.parse_args()

if args.url is not None:
	baseUrl = args.url
else:
	baseUrl = 'https://www.allrecipes.com/recipes/1825/world-cuisine/middle-eastern/turkish/?page='

foodNames=set()
for i in range(1, 50):
	print(f'At page {i}')
	page_response = requests.get(baseUrl+str(i), timeout=10)

	page_content = bs(page_response.content, "html.parser")

#print(page_content)

	for article in page_content.find_all('article', class_='fixed-recipe-card'):
		text = article.findNext('div').findNext('div').h3.a.span
		foodNames.add(text.text)

print(f'Total {len(foodNames)} andn{foodNames}')

with open('TurkishFood.csv', mode='w') as employee_file:
    employee_writer = csv.writer(employee_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for i, name in enumerate(foodNames):
    	employee_writer.writerow([i, name])